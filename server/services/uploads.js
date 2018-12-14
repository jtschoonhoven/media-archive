const path = require('path');
const sql = require('sql-template-strings');

const db = require('../services/database');
const logger = require('../services/logger');

const EXTRA_SPACE_REGEX = new RegExp('\\s+', 'g');
const MEDIA_NAME_BLACKLIST = new RegExp('[^0-9a-zA-Z -]', 'g');
const FILE_NAME_BLACKLIST = new RegExp('[^0-9a-zA-Z_-]', 'g');
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

function getMediaName(fileName) {
    const mediaName = fileName
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

function getSql(mediaName, mediaType, mediaFile, mediaPath, mediaExtn, mediaSize) {
    return sql`
        INSERT INTO media_uploads_pending (
            media_name,
            media_type,
            media_file_name,
            media_file_path,
            media_file_extension,
            media_file_size_bytes
        )
        VALUES (
            ${mediaName}, -- media_name
            ${mediaType}, -- media_type
            ${mediaFile}, -- media_file_name
            ${mediaPath}, -- media_file_path
            ${mediaExtn}, -- media_file_extension
            ${mediaSize}  -- media_file_size_bytes
        );
    `;
}

async function addToPendingUploads(dirPath, fileList) {
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
            mediaPath = path.join(getDirPath(dirPath), getFileName(fileInfo.name));
            mediaExtn = getMediaFileExtension(fileInfo.name);
            mediaSize = parseInt(fileInfo.sizeInBytes, 10);
        }
        catch (err) {
            // add "error" property to fileInfo object on failure and continue
            logger.warn(`ignoring uploaded file ${fileInfo.name}: ${err.toString()}`);
            fileInfo.error = err.toString();
            return;
        }
        // exectute query within a transaction
        const query = getSql(mediaName, mediaType, mediaFile, mediaPath, mediaExtn, mediaSize);
        transaction.add(query);

        // update fileInfo with sanitized name
        fileInfo.originalName = fileInfo.name;
        fileInfo.name = mediaName;
    });
    await transaction.commit();
    return fileList;
}

/*
 * Add pending upload to media_uploads_pending table and return direct upload tokens for S3.
 */
module.exports.upload = async (dirPath, fileList) => {
    const fileListResults = await addToPendingUploads(dirPath, fileList);
    return { results: fileListResults };
};
