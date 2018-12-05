const sql = require('sql-template-strings');

const db = require('../services/database');
const logger = require('../services/logger');

const REGEX_WHITELIST = new RegExp('[^0-9a-zA-Z _(&|!)-]/g');
const REGEX_ALPHA_NUM = new RegExp('[0-9a-zA-Z]+');

/*
 * Query the database for media matching the given search string and filters.
 * For a good explanation of tsvector see
 * http://rachbelaid.com/postgres-full-text-search-is-good-enough
 */
module.exports.query = async (searchString, filters) => {
    const safeSearchString = searchString.replace(REGEX_WHITELIST, ' ');
    const firstWordMatch = searchString.match(REGEX_ALPHA_NUM);
    if (!firstWordMatch.length) {
        return { error: 'Search term must contain at least one letter or number' };
    }
    const query = sql`
        SELECT media.*
        FROM
            media,
            TO_TSQUERY('simple', ${`'${safeSearchString}'`})  AS query_raw,
            TO_TSQUERY('english', ${`'${safeSearchString}'`}) AS query_lex,
            TO_TSQUERY('simple', ${`'${firstWordMatch[0]}':*`}) AS query_pre,
            TS_VECTORIZE_V0(
                media_name,
                media_tags,
                media_description,
                media_authors,
                audio_lecturers,
                image_photographer,
                media_notes,
                media_transcript,
                box_name,
                folder_name,
                series_name,
                series_description,
                media_type,
                media_file_extension,
                media_file_name,
                media_file_path,
                origin_location,
                origin_medium,
                origin_medium_notes
            ) AS tsvector
        WHERE (
                tsvector @@ query_raw -- match exact words in parsed document
            OR  tsvector @@ query_lex -- match word roots in parsed document
            OR  tsvector @@ query_pre -- match any prefix in parsed document
        )
        ORDER BY GREATEST(
            TS_RANK(tsvector, query_raw),
            TS_RANK(tsvector, query_lex)
        )
        LIMIT 10;
    ;`;
    return db.all(query)
        .catch((err) => {
            logger.error(
                `Search error: "${err.message}" sql: "${query.text}" values: "${query.values}"`,
            );
            return { error: `Database raised exception while searching for "${searchString}".` };
        });
};
