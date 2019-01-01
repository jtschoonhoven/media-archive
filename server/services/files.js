const config = require('config');
const sql = require('sql-template-strings');

const db = require('./database');
const s3Service = require('./s3');

const FILENAME_WHITELIST = new RegExp('[^0-9a-zA-Z_-]+', 'g');
const UPLOAD_STATUSES = config.get('CONSTANTS.UPLOAD_STATUSES');
const FILE_EXT_WHITELIST = config.get('CONSTANTS.FILE_EXT_WHITELIST');


/*
 * Parse a file name to return its upper-cased file extension (without leading dot).
 */
function getFileExtension(filename) {
    const extension = filename.toUpperCase().split('.').pop();
    if (!FILE_EXT_WHITELIST[extension]) {
        throw new Error(`File "${filename}" has unsupported file extension "${extension}".`);
    }
    return extension;
}
module.exports.getFileExtension = getFileExtension;

/*
 * Sanitize and normalize filenames.
 */
function getSanitizedFileName(filename) {
    const whitelistChars = '_-';
    const extension = getFileExtension(filename);
    filename = removeFileExtension(filename);
    filename = toAlphaNum(filename, { sub: '-', whitelistChars });
    return `${filename}.${extension}`.toLowerCase();
}
module.exports.getSanitizedFileName = getSanitizedFileName;

/*
 * Sanitize and normalize file paths.
 */
function getSanitizedFilePath(filepath) {
    const whitelistChars = '/_-';
    const extension = getFileExtension(filepath);
    filepath = removeFileExtension(filepath);
    filepath = toAlphaNum(filepath, { sub: '-', whitelistChars });
    return `${filepath}.${extension}`.toLowerCase();
}
module.exports.getSanitizedFilePath = getSanitizedFilePath;

/*
 * Return a copy of `filename` with its file extension removed.
 */
function removeFileExtension(filename) {
    const extension = getFileExtension(filename);
    return filename.slice(0, -extension.length);
}
module.exports.removeFileExtension = removeFileExtension;

/*
 * Fetch the file media category, e.g. "image", "audio", "video", "document".
 */
function getFileType(filename) {
    const extension = getFileExtension(filename);
    return FILE_EXT_WHITELIST[extension].type;
}
module.exports.getFileType = getFileType;

/*
 * Fetch the file MIME type for the given file, based on its extension.
 */
function getFileMimeType(filename) {
    const extension = getFileExtension(filename);
    return FILE_EXT_WHITELIST[extension].mimeType;
}
module.exports.getFileMimeType = getFileMimeType;

/*
 * Generate a "friendly", human-readable title from the given file name.
 */
function getFileTitle(filename) {
    filename = removeFileExtension(filename);
    const whitelistChars = '!&().-';
    const sanitized = toAlphaNum(filename, { sub: ' ', whitelistChars });
    return _toTitleCase(sanitized);
}
module.exports.getFileTitle = getFileTitle;

/*
 * Sanitize a string by stripping non alphanumeric characters.
 *
 * - Accepts additional options to whitelist special characters.
 * - Removes "duplicate" non-alphanumeric characters from string.
 * - Trims any non-alphanumeric from start and end of string.
 */
function toAlphaNum(str, { sub = '', whitelistChars = '' } = {}) {
    const whitelistRegex = new RegExp(`[^a-zA-Z0-9${whitelistChars}]`, 'g');
    const duplicateRegex = new RegExp('([^a-zA-Z0-9])(?=\\1)', 'g');
    const trimRegex = new RegExp('(^[^A-Za-z0-9]+)|[^A-Za-z0-9]+$', 'g');
    return str.replace(whitelistRegex, sub).replace(duplicateRegex, '').replace(trimRegex, '');
}
module.exports.toAlphaNum = toAlphaNum;

/*
 * Retrieve a list of directories and files at the given path.
 */
async function load(path) {
    const query = _getLoadSQL(path);
    const rows = await db.all(query);
    return { results: rows };
}
module.exports.load = load;

/*
 * Get metadata for a file with the given id for display.
 */
async function detail(fileId) {
    const details = await db.get(sql`
        SELECT
            id AS "id",
            uuid AS "uuid",
            media_name AS "title",
            media_type AS "type",
            media_description AS "description",
            media_tags AS "tags",
            media_url AS "url",
            media_url_thumbnail AS "thumbnailUrl",
            media_file_name AS "filename",
            media_file_path AS "path",
            media_file_extension AS "extension",
            upload_status AS "uploadStatus"
        FROM media
        WHERE id = ${fileId};
    `);
    if (!details) {
        return { error: `No file exists with id ${fileId}`, statusCode: 404 };
    }
    // replace an (unsigned) S3 url with a usable signed url
    if (s3Service.isS3Url(details.url)) {
        details.url = s3Service.getPresignedUrl(details.url);
    }
    if (s3Service.isS3Url(details.thumbnailUrl)) {
        details.thumbnailUrl = s3Service.getPresignedUrl(details.thumbnailUrl);
    }
    return { details };
}
module.exports.detail = detail;

/*
 * Mark a file in the DB as deleted. Sets "deleted_at", does not *truly* delete anything.
 */
async function remove(fileId) {
    // FIXME: verify delete succeeded before returning success
    await db.run(sql`UPDATE media SET deleted_at = NOW() WHERE id = ${fileId};`);
    return {};
}
module.exports.remove = remove;

/*
 * Helper method to convert a string to Title Case.
 */
function _toTitleCase(str) {
    return str.split(' ').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
}

/*
 * Generate the paramaterized SQL string used to retrieve the contents of a given directory.
 */
function _getLoadSQL(path) {
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
}
