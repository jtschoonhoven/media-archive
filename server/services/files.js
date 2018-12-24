const sql = require('sql-template-strings');

const db = require('./database');
const s3Service = require('./s3');

const FILENAME_WHITELIST = new RegExp('[^0-9a-zA-Z_-]+', 'g');


const getSQL = (path, userEmail) => {
    let pathArray = [];
    if (path.trim()) {
        pathArray = path.split('/').map(dir => dir.replace(FILENAME_WHITELIST, '-'));
    }
    // FIXME: use sql-template-strings here
    return `
        SELECT
            CASE
                WHEN ARRAY_LENGTH(media_file_path_array, 1) > ${pathArray.length + 1}
                    THEN 'directory'
                WHEN upload_status = 'pending'
                    THEN 'upload'
                ELSE 'file'
            END AS type,
            media_file_path_array[${pathArray.length + 1}] AS name,
            MAX(id) AS id,
            COUNT(1) AS num_entries
        FROM media
        WHERE deleted_at IS NULL
        AND (
            -- only include pending uploads from the current user
            upload_status != 'pending'
            OR (upload_status = 'pending' AND upload_email = '${userEmail}')
        )
        ${pathArray.length ? 'AND' : ''}
        ${
            pathArray
                .map((dir, idx) => `media_file_path_array[${idx + 1}] = '${dir}'`)
                .join('\nAND ')
        }
        GROUP BY name, type
        ORDER BY type ASC, num_entries DESC, name ASC
        ;`;
};

module.exports.detail = async (fileId) => {
    // FIXME: return whitelisted fields instead of entire row
    const details = await db.get(sql`SELECT * FROM media WHERE id = ${fileId};`);
    return { details };
};

module.exports.load = async (path, userEmail) => {
    if (path.startsWith('/')) {
        path = path.slice(1);
    }
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    const query = getSQL(path, userEmail);
    const rows = await db.all(query);

    // add S3 upload credentials for each pending upload
    rows.forEach((fileObj) => {
        if (fileObj.type === 'upload') {
            fileObj.s3UploadAuth = s3Service.getS3UploadAuth(fileObj.media_file_name);
        }
    });
    return { results: rows };
};

/*
 * Mark a file in the DB as deleted. Sets "deleted_at", does not *truly* delete anything.
 */
module.exports.delete = async (fileId) => {
    await db.run(sql`UPDATE media SET deleted_at = NOW() WHERE id = ${fileId};`);
    return { deletions: [parseInt(fileId, 10)] };
};
