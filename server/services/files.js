const db = require('../services/database');

const FILENAME_WHITELIST = new RegExp('[^0-9a-zA-Z_-]+', 'g');


const getSQL = (path) => {
    let pathArray = [];
    if (path.trim()) {
        pathArray = path.split('/').map(dir => dir.replace(FILENAME_WHITELIST, '-'));
    }
    return `
        SELECT
            CASE
                WHEN ARRAY_LENGTH(media_file_path_array, 1) > ${pathArray.length + 1}
                THEN 'directory'
                ELSE 'file'
            END AS type,
            media_file_path_array[${pathArray.length + 1}] AS name,
            MAX(id) AS id,
            COUNT(1) AS num_entries
        FROM media
        ${pathArray.length ? 'WHERE' : ''}
        ${
            pathArray
                .map((dir, idx) => `media_file_path_array[${idx + 1}] = '${dir}'`)
                .join('\nAND ')
        }
        GROUP BY name, type
        ORDER BY type ASC, num_entries DESC, name ASC
        ;`;
};

module.exports.load = async (path) => {
    if (path.startsWith('/')) {
        path = path.slice(1);
    }
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    const sql = getSQL(path);
    const rows = await db.all(sql);
    return { results: rows, path };
};
