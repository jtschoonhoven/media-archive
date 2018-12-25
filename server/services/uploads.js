const config = require('config');
const path = require('path');
const sql = require('sql-template-strings');
const uuidv4 = require('uuid/v4');

const db = require('./database');
const filesService = require('./files');
const logger = require('./logger');

const FILE_EXT_WHITELIST = config.get('CONSTANTS.FILE_EXT_WHITELIST');
const UPLOAD_STATUSES = config.get('CONSTANTS.UPLOAD_STATUSES');

const EXTRA_SPACE_REGEX = new RegExp('\\s+', 'g');
const MEDIA_NAME_BLACKLIST = new RegExp('[^0-9a-zA-Z -]', 'g');
const FILE_NAME_BLACKLIST = new RegExp('[^0-9a-zA-Z._-]', 'g');
const FILE_PATH_BLACKLIST = new RegExp('[^0-9a-zA-Z_/-]', 'g');
const MEDIA_FILE_EXTENSION_BLACKLIST = new RegExp('[^0-9a-zA-Z]', 'g');


function getDirPath(dirPath) {
    if (dirPath.startsWith('/')) { // strip leading slashes
        dirPath = dirPath.slice(1);
    }
    if (dirPath.endsWith('/')) { // strip trailing slashes
        dirPath = dirPath.slice(0, -1);
    }
    if (dirPath.match(FILE_PATH_BLACKLIST)) {
        throw new Error(`Cannot upload to ${dirPath}: contains illegal characters`);
    }
    return dirPath;
}

function getFileName(rawFileName) {
    return rawFileName.replace(FILE_NAME_BLACKLIST, '-');
}

function getFilePath(dirPath, fileName) {
    return path.join(getDirPath(dirPath), getFileName(fileName));
}

function getMediaName(fileName) {
    const extension = path.extname(fileName);
    const mediaName = fileName
        .slice(0, -extension.length) // remove file extension
        .replace(MEDIA_NAME_BLACKLIST, ' ') // remove illegal characters
        .replace(EXTRA_SPACE_REGEX, ' '); // remove redundant whitespace
    if (!mediaName.length) {
        throw new Error(`Cannot upload ${fileName}: contains illegal characters.`);
    }
    return mediaName;
}

function getMediaFileExtension(fileName) {
    const extension = fileName
        .toUpperCase()
        .split('.')
        .pop();
    if (extension.match(MEDIA_FILE_EXTENSION_BLACKLIST)) {
        throw new Error(`Cannot upload ${fileName}: extension contains illegal characters.`);
    }
    if (fileName.startsWith('.')) {
        throw new Error(`Cannot upload ${fileName}: names cannot start with a dot.`);
    }
    if (fileName.indexOf('.') < 0) {
        throw new Error(`Cannot upload ${fileName}: names must contain a file extension.`);
    }
    return extension;
}

function getMediaType(fileName) {
    const extension = getMediaFileExtension(fileName);
    const mediaType = FILE_EXT_WHITELIST[extension].type;
    if (!mediaType) {
        throw new Error(`Cannot upload ${fileName}: extension ${extension} is not supported.`);
    }
    return mediaType;
}

function getInsertSql(
    mediaFileUnsafe,
    mediaName,
    mediaType,
    mediaFile,
    mediaPath,
    mediaExtn,
    mediaSize,
    userEmail,
) {
    const uuid = uuidv4(); // generate secure, random uuid
    return sql`
        INSERT INTO media (
            uuid,
            media_name,
            media_type,
            media_file_name,
            media_file_name_unsafe,
            media_file_path,
            media_file_extension,
            media_file_size_bytes,
            upload_email,
            upload_status,
            upload_started_at
        )
        VALUES (
            ${uuid}, -- uuid
            ${mediaName}, -- media_name
            ${mediaType}, -- media_type
            ${mediaFile}, -- media_file_name
            ${mediaFileUnsafe}, -- media_file_name_unsafe
            ${mediaPath}, -- media_file_path
            ${mediaExtn}, -- media_file_extension
            ${mediaSize}, -- media_file_size_bytes
            ${userEmail}, -- upload_email
            ${UPLOAD_STATUSES.PENDING}, -- upload_status
            NOW() -- upload_started_at
        );
    `;
}

/*
 * Select all files with the given name in the given directory from a list of file objects.
 */
function getSelectSQL(dirPath, fileList) {
    // FIXME: select specific columns here instead of the glob
    const query = sql`
        SELECT *, 'upload' AS type FROM media WHERE deleted_at IS NULL AND (FALSE
    `;
    fileList.forEach((fileInfo) => {
        const mediaPath = getFilePath(dirPath, fileInfo.name);
        query.append(sql`OR media_file_path = ${mediaPath}`);
    });
    query.append(sql`);`);
    return query;
}

/*
 * Throw an error if the DB already contains a file at the same path as an upload in fileList.
 */
async function checkDuplicates(dirPath, fileList) {
    const query = getSelectSQL(dirPath, fileList);
    const result = await db.all(query);
    if (result.length) {
        const dupeName = result[0].media_name;
        const dupePath = result[0].media_file_path;
        throw new Error(`Cannot upload batch with duplicate file "${dupeName}" at "${dupePath}"`);
    }
}

async function addFilesToDb(dirPath, fileList, userEmail) {
    const transaction = new db.Transaction();

    try {
        fileList.forEach((fileInfo) => {
            // validate and sanitize uploaded file info
            const mediaName = getMediaName(fileInfo.name);
            const mediaType = getMediaType(fileInfo.name);
            const mediaFile = getFileName(fileInfo.name);
            const mediaPath = getFilePath(dirPath, fileInfo.name);
            const mediaExtn = getMediaFileExtension(fileInfo.name);
            const mediaSize = parseInt(fileInfo.sizeInBytes, 10);

            // exectute query within a transaction
            const query = getInsertSql(
                fileInfo.name,
                mediaName,
                mediaType,
                mediaFile,
                mediaPath,
                mediaExtn,
                mediaSize,
                userEmail,
            );
            transaction.add(query);
        });
    }
    catch (err) {
        logger.error(`rolling back files upload: "${err.message}"`);
        await transaction.rollback();
        throw err;
    }
    await transaction.commit();
}

/*
 * Add pending upload to media_uploads_pending table and return direct upload auth for S3.
 * Returns ALL files in directory (not just uploads).
 */
module.exports.upload = async (dirPath, fileList, userEmail) => {
    // throw an error if any uploaded file contains a filename already in the directory
    try {
        await checkDuplicates(dirPath, fileList);
    }
    catch (err) {
        return { error: err.message };
    }
    // add all files to the DB in "pending" state
    await addFilesToDb(dirPath, fileList, userEmail);
    // load the list of all files in the directory (not just uploads)
    const directoryList = await filesService.load(dirPath, userEmail);
    if (directoryList.error) {
        return directoryList;
    }
    // return the list of all files in directory
    return directoryList;
};

/*
 * Mark a file in the DB as deleted. Sets "deleted_at", does not *truly* delete anything.
 */
module.exports.cancel = async (fileId, userEmail) => {
    // FIXME: first validate that the user is allowed to delete this file
    const query = sql`
        UPDATE media
        SET deleted_at = NOW(), upload_status = ${UPLOAD_STATUSES.ABORTED}
        WHERE id = ${fileId}
        AND upload_status = ${UPLOAD_STATUSES.PENDING}
        AND upload_email = ${userEmail};
    `;
    await db.run(query);
    // FIXME: this shouldn't return as successful if nothing was deleted
    return { deletions: [parseInt(fileId, 10)] };
};
