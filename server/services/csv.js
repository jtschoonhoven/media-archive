const config = require('config');
const sql = require('sql-template-strings');

const filesService = require('./files');

const FILENAME_BLACKLIST = config.get('CONSTANTS.REGEX.FILENAME_BLACKLIST');
const UPLOAD_STATUSES = config.get('CONSTANTS.UPLOAD_STATUSES');


module.exports.download = async (path) => {
    return 'ok';
};

/*
 * Generate the paramaterized SQL string used to retrieve the contents of a given directory.
 */
function _getLoadSQL(path) {
    path = filesService.trimSlashes(path);

    let pathArray = [];
    if (path) {
        pathArray = path.split('/').map(dir => filesService.sanitize(dir, FILENAME_BLACKLIST, '-'));
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
            media_name AS "title",
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
        GROUP BY "name", "title", "path", "entryType"
        ORDER BY "entryType" ASC, "numEntries" DESC, "title" ASC, "name" ASC;
    `);
    return query;
}
