const db = require('../services/database');
const logger = require('../services/logger');

const REGEX_WHITELIST = new RegExp('[^0-9a-zA-Z _(&|!)-]/g');
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
        logger.error(`failed to serialize pagination key: ${err.toString()}`);
    }
    return null;
}

/*
 * Deserialize a page key back into its id and relevance score.
 */
function deserializePageKey(key) {
    let safeKey = key || '';
    safeKey = safeKey.replace(REGEX_WHITELIST, '');
    if (!safeKey) {
        return null;
    }
    try {
        return {
            id: parseInt(safeKey.slice(0, -2), 16),
            relevance: parseInt(safeKey.slice(-2), 16),
        };
    }
    catch (err) {
        logger.error(`failed to deserialize pagination key: ${err.toString()}`);
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
    // remove any characters not in whitelist
    const safeSearchString = searchString.replace(REGEX_WHITELIST, ' ');
    return safeSearchString.split(' ').reduce((result, word) => {
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

/*
 * Query the database for media matching the given search string and filters.
 * For a good explanation of tsvector see
 * http://rachbelaid.com/postgres-full-text-search-is-good-enough
 */
async function runQuery(searchString, filters) {
    const { limit, prevKey, nextKey, document, image, video, audio } = filters;
    const safeSearchString = sanitizeSearchString(searchString);
    const firstWordMatch = toAlphaNum(safeSearchString);
    const isPrecise = QUERY_LOGIC_CHARS.some(char => safeSearchString.includes(char));

    if (!firstWordMatch) {
        return { error: 'Search term must contain at least one letter or number' };
    }
    if (nextKey && prevKey) {
        return { error: 'nextKey and prevKey query params are mutually exclusive' };
    }

    const typeFilters = [];
    if (document) {
        typeFilters.push('\'document\'');
    }
    if (image) {
        typeFilters.push('\'image\'');
    }
    if (video) {
        typeFilters.push('\'video\'');
    }
    if (audio) {
        typeFilters.push('\'audio\'');
    }

    const query = `
        SELECT media.*, relevance
        FROM
            media,
            TO_TSQUERY('english', '${safeSearchString}')    AS query_lex,
            TO_TSQUERY('simple',  '${firstWordMatch[0]}:*') AS query_pre,
            TS_VECTORIZE_V0(
                media.media_name,
                media.media_tags,
                media.media_description,
                media.media_authors,
                media.audio_lecturers,
                media.image_photographer,
                media.media_notes,
                media.media_transcript,
                media.box_name,
                media.folder_name,
                media.series_name,
                media.series_description,
                media.media_type,
                media.media_file_extension,
                media.media_file_name,
                media.media_file_path,
                media.origin_location,
                media.origin_medium,
                media.origin_medium_notes
            ) AS tsvector,
            TS_RELEVANCE_V0(tsvector, query_lex, query_pre) AS relevance
        WHERE (
                tsvector @@ query_lex -- matches word roots in parsed document
        ${!isPrecise ? `
            OR  tsvector @@ query_pre -- matches any prefix in parsed document
            ` : '-- precise search enabled'
        }
        )
        ${typeFilters.length ? `
            AND media.media_type IN (${typeFilters.join(', ')})
            ` : '-- type filters disabled'
        }
        ${nextKey ? `
            -- pagination: get next page of results
            AND relevance <= ${nextKey.relevance}
            AND NOT (relevance = ${nextKey.relevance} AND media.id >= ${nextKey.id})
        ` : '-- forward pagination disabled'
        }
        ${prevKey ? `
            -- pagination: get previous page of results
            AND relevance >= ${prevKey.relevance}
            AND NOT (relevance = ${prevKey.relevance} AND media.id <= ${prevKey.id})
        ` : '-- backwards pagination disabled'
        }
        ${!prevKey ? `
             ORDER BY relevance DESC, media.id DESC
        ` : 'ORDER BY relevance ASC, media.id ASC'
        }
        LIMIT ${limit + 1} -- fetch one extra row to detect extra pages
    ;`;
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
