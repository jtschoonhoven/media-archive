const sql = require('sql-template-strings');

const db = require('../services/database');
const logger = require('../services/logger');


/*
 * Query the database for media matching the given search string and filters.
 */
module.exports.query = async (searchString, filters) => {
    const query = sql`
        SELECT id, media_name, media_description, media_tags, media_url, media_url_thumbnail
        FROM media
        WHERE LOWER(media_name) LIKE '%' || LOWER(${searchString}) || '%'
    ;`;
    return db.all(query)
        .catch((err) => {
            logger.error(
                `Search error: "${err.message}" sql: "${query.text}" values: "${query.values}"`,
            );
            return { error: `Database raised exception while searching for "${searchString}".` };
        });
};
