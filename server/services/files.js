const config = require('config');
const sql = require('sql-template-strings');

const db = require('./database');

const FILENAME_WHITELIST = new RegExp('[^0-9a-zA-Z_-]+', 'g');
const UPLOAD_STATUSES = config.get('CONSTANTS.UPLOAD_STATUSES');


const getSQL = (path) => {
    path = path.startsWith('/') ? path.slice(1) : path;
    path = path.endsWith('/') ? path.slice(0, -1) : path;

    let pathArray = [];
    if (path.trim()) {
        pathArray = path.split('/').map(dir => dir.replace(FILENAME_WHITELIST, '-'));
    }

    const query = sql`
        SELECT
            CASE
                WHEN ARRAY_LENGTH(media_file_path_array, 1) > ${pathArray.length + 1}
                    THEN 'directory'
                ELSE 'file'
            END AS "entryType",
            ${path} AS "path",
            media_file_path_array[${pathArray.length + 1}] AS "name",
            MAX(media_type) AS "mediaType",
            MAX(id) AS "id",
            MAX(uuid) AS "uuid",
            COUNT(1) AS "numEntries"
        FROM media
        WHERE deleted_at IS NULL
        AND upload_status = ${UPLOAD_STATUSES.SUCCESS}
    `;

    // match only items in this directory
    pathArray.forEach((dir, idx) => {
        query.append(sql`\nAND media_file_path_array[${idx + 1}] = ${dir}`);
    });

    query.append(`
        GROUP BY "name", "path", "entryType"
        ORDER BY "entryType" ASC, "numEntries" DESC, "name" ASC;
    `);
    return query;
};

module.exports.detail = async (fileId) => {
    // FIXME: return whitelisted fields instead of entire row
    const details = await db.get(sql`SELECT * FROM media WHERE id = ${fileId};`);
    return { details };
};

module.exports.load = async (path) => {
    const query = getSQL(path);
    const rows = await db.all(query);
    return { results: rows };
};

/*
 * Mark a file in the DB as deleted. Sets "deleted_at", does not *truly* delete anything.
 */
module.exports.delete = async (fileId) => {
    // FIXME: verify delete succeeded before returning success
    await db.run(sql`UPDATE media SET deleted_at = NOW() WHERE id = ${fileId};`);
    return {};
};
