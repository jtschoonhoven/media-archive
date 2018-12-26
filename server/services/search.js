const sql = require('sql-template-strings');

const db = require('../services/database');
const logger = require('../services/logger');

const REGEX_ALPHA_NUM = new RegExp('[0-9a-zA-Z]+');
const QUERY_LOGIC_CHARS = ['!', '&', '|', '(', ')'];
const QUERY_GROUP_CHARS = ['&', '|', '(', ')'];
const DEFAULT_LIMIT = 10;

/*
 * Return an hex value that uniquely identifies a search result. Used to support pagination.
 * The two rightmost (base 16) digits are the relevance score. Remaining digits are the ID.
 */
function serializePageKey(id, relevanceScore) {
    try {
        const hexId = id.toString(16);
        const hexScore = relevanceScore.toString(16).padStart(2, '0');
        return `${hexId}${hexScore}`;
    }
    catch (err) {
        logger.error(`failed to serialize pagination key: ${err.message}`);
    }
    return null;
}

/*
 * Deserialize a page key back into its id and relevance score.
 */
function deserializePageKey(key) {
    if (!key) {
        return null;
    }
    try {
        return {
            id: parseInt(key.slice(0, -2), 16),
            relevance: parseInt(key.slice(-2), 16),
        };
    }
    catch (err) {
        logger.error(`failed to deserialize pagination key: ${err.message}`);
    }
    return null;
}

/*
 * Remove any non-alphamueric (English) characters.
 */
function toAlphaNum(str) {
    const match = str.match(REGEX_ALPHA_NUM);
    if (match) {
        return match[0];
    }
    return '';
}

/*
 * Sanitize and prepare a search query.
 * Enforces use of logical operators.
 */
function sanitizeSearchString(searchString) {
    return searchString.split(' ').reduce((result, word) => {
        // skip empty strings
        if (!word) {
            return result;
        }
        // always append boolean operators
        if (QUERY_GROUP_CHARS.includes(word)) {
            return `${result} ${word}`;
        }
        // append terms following any boolean operator
        const lastChar = result.slice(-1);
        if (QUERY_LOGIC_CHARS.includes(lastChar)) {
            return `${result} ${word}`;
        }
        // prepend AND operator before a negated term if not otherwise specified
        const firstChar = word[0];
        if ([word, firstChar].includes('!')) {
            return `${result} & ${word}`;
        }
        // prepend OR operator before a positive term if not otherwise specified
        const safeWord = toAlphaNum(word);
        return safeWord ? `${result} | ${safeWord}` : result;
    });
}

function getSearchSql(searchString, typeFilters, prevKey, nextKey, limit) {
    const safeSearchString = sanitizeSearchString(searchString);
    const firstWord = toAlphaNum(safeSearchString);
    const isPrecise = QUERY_LOGIC_CHARS.some(char => safeSearchString.includes(char));
    const query = sql`
        SELECT media.*, relevance
        FROM
            media,
            TO_TSQUERY('english', ${safeSearchString}) AS query_lex,
            TO_TSQUERY('simple',  ${`${firstWord}:*`}) AS query_pre,
            TS_RELEVANCE_V0(media_tsvector, query_lex, query_pre) AS relevance
        WHERE deleted_at IS NULL
    `;

    // if this is precise mode (i.e. a logical operator was used), search only on word roots
    if (isPrecise) {
        query.append('\nAND media_tsvector @@ query_lex');
    }
    // otherwise (no logical operator used), search on word roots and on prefixes
    else {
        query.append(sql`
            AND (
                media_tsvector @@ query_lex -- word roots
                OR media_tsvector @@ query_pre -- word prefixes
            )
        `);
    }

    // filter on type of media if specified
    if (typeFilters.length) {
        query.append('\nAND (\n');
        query.append(
            typeFilters.map(typeFilter => sql`media_type = ${typeFilter}`).join('\nOR '),
        );
        query.append('\n)');
    }

    // add forward pagination key if set
    if (nextKey) {
        query.append(sql`
            -- pagination: get next page of results
            AND relevance <= ${nextKey.relevance}
            AND NOT (relevance = ${nextKey.relevance} AND media.id >= ${nextKey.id})
        `);
    }
    // add backward pagination key if set
    else if (prevKey) {
        query.append(sql`
            -- pagination: get previous page of results
            AND relevance >= ${prevKey.relevance}
            AND NOT (relevance = ${prevKey.relevance} AND media.id <= ${prevKey.id})
        `);
    }

    // sort by descending relevance unless we're paginating backwards
    if (!prevKey) {
        query.append('\nORDER BY relevance DESC, media.id DESC');
    }
    // if paginating backwards, reverse the usual order
    else {
        query.append('\nORDER BY relevance ASC, media.id ASC');
    }

    // fetch one extra row to detect extra pages (the extra is not returned to the client)
    query.append(sql`\nLIMIT ${limit + 1}`);
    return query;
}

/*
 * Query the database for media matching the given search string and filters.
 * For a good explanation of tsvector see
 * http://rachbelaid.com/postgres-full-text-search-is-good-enough
 */
async function runQuery(searchString, filters) {
    const { limit, prevKey, nextKey, document, image, video, audio } = filters;

    const typeFilters = [];
    if (document) {
        typeFilters.push('document');
    }
    if (image) {
        typeFilters.push('image');
    }
    if (video) {
        typeFilters.push('video');
    }
    if (audio) {
        typeFilters.push('audio');
    }

    const query = getSearchSql(searchString, typeFilters, prevKey, nextKey, limit);

    return db.all(query)
        .catch((err) => {
            logger.error(`${err.stack}\n${query}`);
            return {
                error: `\
                    Something went wrong with your search.
                    If you're using a logical expression with (!&|), please verify that it's valid.`,
            };
        });
}

/*
 * Execute search query and return results with pagination data.
 */
module.exports.query = async (searchString, filters) => {
    filters.nextKey = deserializePageKey(filters.nextKey);
    filters.prevKey = deserializePageKey(filters.prevKey);
    filters.limit = filters.limit || DEFAULT_LIMIT;

    // execute query
    const rows = await runQuery(searchString, filters);

    // check if "user-friendly" error was raised
    if (rows.error) {
        return rows;
    }

    let newNextKey;
    let newPrevKey;
    const limit = filters.limit;

    // if there are more rows than requested, return a key to access the next page
    if (rows.length > limit) {
        rows.pop(); // remove extra row
        newNextKey = serializePageKey(rows[limit - 1].id, rows[limit - 1].relevance);
    }
    // if a page key was used on THIS query, send a key to return to the previous page
    if (rows.length && (filters.nextKey || filters.prevKey)) {
        newPrevKey = serializePageKey(rows[0].id, rows[0].relevance);
    }

    // if we were searching backwards, flip values around to maintain forward order
    if (filters.prevKey) {
        const _newNextKey = newNextKey;
        newNextKey = newPrevKey;
        newPrevKey = _newNextKey;
        rows.reverse();
    }

    return {
        nextKey: newNextKey,
        prevKey: newPrevKey,
        results: rows,
        success: true,
    };
};
