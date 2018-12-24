const path = require('path');
const sql = require('sql-template-strings');
const uuidv4 = require('uuid/v4');

const db = require('./database');
const filesService = require('./files');
const logger = require('./logger');
const s3Service = require('./s3');

const EXTRA_SPACE_REGEX = new RegExp('\\s+', 'g');
const MEDIA_NAME_BLACKLIST = new RegExp('[^0-9a-zA-Z -]', 'g');
const FILE_NAME_BLACKLIST = new RegExp('[^0-9a-zA-Z._-]', 'g');
const FILE_PATH_BLACKLIST = new RegExp('[^0-9a-zA-Z_/-]', 'g');
const MEDIA_FILE_EXTENSION_BLACKLIST = new RegExp('[^0-9a-zA-Z]', 'g');

const DOCUMENT = 'document';
const IMAGE = 'image';
const AUDIO = 'audio';
const VIDEO = 'video';

const EXTENSION_TYPES = {
    'PDF': DOCUMENT,
    'DOC': DOCUMENT,
    'DOCX': DOCUMENT,
    'TIFF': DOCUMENT,
    'PNG': IMAGE,
    'JPG': IMAGE,
    'WAV': AUDIO,
    'MP4': VIDEO,
};

const UPLOAD_TYPE = 'upload';
const UPLOAD_PENDING = 'pending';
const UPLOAD_FAILURE = 'failure';
const UPLOAD_SUCCESS = 'success';

const UPLOAD_STATUSES = {
    UPLOAD_PENDING,
    UPLOAD_FAILURE,
    UPLOAD_SUCCESS,
};


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
    const mediaType = EXTENSION_TYPES[extension];
    if (!mediaType) {
        throw new Error(`Cannot upload ${fileName}: extension ${extension} is not supported.`);
    }
    return mediaType;
}

function getInsertSql(
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
            ${mediaPath}, -- media_file_path
            ${mediaExtn}, -- media_file_extension
            ${mediaSize}, -- media_file_size_bytes
            ${userEmail}, -- upload_email
            ${UPLOAD_PENDING}, -- upload_status
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

    fileList.forEach((fileInfo) => {
        let mediaName;
        let mediaType;
        let mediaFile;
        let mediaPath;
        let mediaExtn;
        let mediaSize;
        try {
            // validate and sanitize uploaded file info
            mediaName = getMediaName(fileInfo.name);
            mediaType = getMediaType(fileInfo.name);
            mediaFile = getFileName(fileInfo.name);
            mediaPath = getFilePath(dirPath, fileInfo.name);
            mediaExtn = getMediaFileExtension(fileInfo.name);
            mediaSize = parseInt(fileInfo.sizeInBytes, 10);
        }
        catch (err) {
            // add "error" property to fileInfo object on failure and continue
            logger.warn(`ignoring uploaded file ${fileInfo.name}: ${err.message}`);
            fileInfo.error = err.message;
            return;
        }
        // exectute query within a transaction
        const query = getInsertSql(
            mediaName,
            mediaType,
            mediaFile,
            mediaPath,
            mediaExtn,
            mediaSize,
            userEmail,
        );
        transaction.add(query);

        // update fileInfo with sanitized name
        fileInfo.originalName = fileInfo.name;
        fileInfo.name = mediaName;
        fileInfo.path = mediaPath;
        fileInfo.status = UPLOAD_PENDING;
        fileInfo.type = UPLOAD_TYPE;
    });
    await transaction.commit();
    return fileList;
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
    // generate S3 upload credentials for pending uploads
    directoryList.results.forEach((fileObj) => {
        if (fileObj.type === UPLOAD_TYPE) {
            fileObj.s3UploadAuth = s3Service.getS3UploadAuth(fileObj.media_file_path);
        }
    });
    // return the list of all files in directory
    return directoryList;
};
