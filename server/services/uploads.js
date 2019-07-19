const config = require('config');
const path = require('path');
const sql = require('sql-template-strings');
const uuidv4 = require('uuid/v4');

const db = require('./database');
const logger = require('./logger');
const s3Service = require('./s3');
const filesService = require('./files');

const UPLOAD_STATUSES = config.get('CONSTANTS.UPLOAD_STATUSES');


/**
 * Add pending uploads to table and return direct upload auth for S3.
 * @param {string} dirpath - path to file location in virtual file system
 * @param {FileList} fileList - see https://developer.mozilla.org/en-US/docs/Web/API/FileList
 * @param {string} userEmail - email of user who initiated upload
 */
module.exports.upload = async (dirPath, fileList, userEmail) => {
    const fileListUploads = [];
    const fileListCSV = [];
    dirPath = filesService.trimSlashes(dirPath);

    // separate CSVs and regular uploads into separate arrays
    fileList.forEach((fileInfo) => {
        const mediaExtn = filesService.getFileExtension(fileInfo.name);
        if (mediaExtn === 'CSV') {
            return fileListCSV.push(fileInfo);
        }
        return fileListUploads.push(fileInfo);
    });

    // throw an error if any uploaded file contains a filename already in the directory
    try {
        if (fileListUploads.length) {
            await checkDuplicates(dirPath, fileListUploads);
        }
        if (fileListCSV.length) {
            await checkDuplicates(dirPath, fileListCSV);
        }
    }
    catch (err) {
        return { error: err.message, statusCode: 400 };
    }

    // add all files to the DB in "pending" state
    const uploadBatchId = await addFilesToDb(dirPath, fileList, userEmail);

    // return all pending uploads from this batch
    const rows = await db.all(sql`
        SELECT
            id,
            uuid,
            ${dirPath} AS "directoryPath",
            media_file_path AS "path",
            media_file_path_array AS "pathArray",
            media_file_name AS "name",
            media_file_name_unsafe AS "nameUnsafe",
            media_type AS "mediaType",
            media_file_extension AS "extension",
            media_url AS "s3Url"
        FROM media
        WHERE deleted_at IS NULL
        AND upload_status = ${UPLOAD_STATUSES.PENDING}
        AND upload_email = ${userEmail}
        AND upload_batch_id = ${uploadBatchId}
        ORDER BY created_at, media_file_name;
    `);

    // add S3 upload credentials to each item
    for (const fileObj of rows) { // eslint-disable-line no-restricted-syntax
        const s3SignedPost = await s3Service.getPresignedPost(fileObj.s3Url, fileObj.name); // eslint-disable-line no-await-in-loop, max-len
        fileObj.s3UploadUrl = s3SignedPost.url;
        fileObj.s3UploadPolicy = s3SignedPost.fields;
    }
    return { uploads: rows };
};

/*
 * Update the status of an upload.
 */
module.exports.update = async (fileId, status) => {
    if (!Object.values(UPLOAD_STATUSES).includes(status)) {
        throw new Error(`Uploads API received invalid status for file ${fileId}: "${status}"`);
    }
    const query = sql`
        UPDATE media
        SET
            upload_status = ${status},
            upload_finished_at = NOW()
        WHERE id = ${fileId};
    `;
    await db.run(query);
    return {};
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
    return {};
};

/**
 * Save each file in the fileList to the DB in a "pending" state.
 * @param {string} dirpath - path to file location in virtual file system
 * @param {FileList} fileList - see https://developer.mozilla.org/en-US/docs/Web/API/FileList
 * @param {string} userEmail - email of user who initiated upload
 */
async function addFilesToDb(dirPath, fileList, userEmail) {
    const uploadBatchId = uuidv4();
    const transaction = new db.Transaction();

    try {
        fileList.forEach((fileInfo) => {
            // validate and sanitize uploaded file info
            const mediaType = filesService.getFileType(fileInfo.name);
            const mediaFile = filesService.getSanitizedFileName(fileInfo.name);
            const mediaExtn = filesService.getFileExtension(fileInfo.name);
            const mediaSize = parseInt(fileInfo.sizeInBytes, 10);
            let mediaName = filesService.getFileTitle(fileInfo.name);
            let mediaPath = filesService.getSanitizedFilePath(path.join(dirPath, mediaFile));

            // special-case CSV uploads: redirect them to the special CSV folder
            if (mediaExtn === 'CSV') {
                mediaPath = filesService.getSanitizedCsvFilePath(mediaPath);
                mediaName = mediaFile; // use raw filename as title
            }

            // exectute query within a transaction
            const query = _getInsertSql(
                uploadBatchId,
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
    return uploadBatchId;
}

/*
 * Throw an error if the DB already contains a file at the same path as an upload in fileList.
 */
async function checkDuplicates(dirPath, fileList) {
    const query = sql`
        SELECT *
        FROM media
        WHERE deleted_at IS NULL
        AND upload_status = ${UPLOAD_STATUSES.SUCCESS}
        AND deleted_at IS NULL
        AND (
            media_file_path LIKE ${dirPath} || '/%'
            OR media_file_path = '~csv'
        )
        AND (FALSE
    `;
    fileList.forEach((fileInfo) => {
        query.append(sql`OR media_file_name_unsafe = ${fileInfo.name}\n`);
    });
    query.append(sql`)`);
    const result = await db.all(query);
    if (result.length) {
        const dupeName = result[0].media_name;
        const dupePath = result[0].media_file_path;
        throw new Error(`Cannot upload batch with duplicate file "${dupeName}" at "${dupePath}"`);
    }
}

function _getInsertSql(
    uploadBatchId,
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
    const mediaUrl = s3Service.getS3Url(uuid, mediaExtn);
    return sql`
        INSERT INTO media (
            uuid,
            media_name,
            media_url,
            media_type,
            media_file_name,
            media_file_name_unsafe,
            media_file_path,
            media_file_extension,
            media_file_size_bytes,
            upload_email,
            upload_status,
            upload_batch_id,
            upload_started_at
        )
        VALUES (
            ${uuid}, -- uuid
            ${mediaName}, -- media_name
            ${mediaUrl}, -- media_url
            ${mediaType}, -- media_type
            ${mediaFile}, -- media_file_name
            ${mediaFileUnsafe}, -- media_file_name_unsafe
            ${mediaPath}, -- media_file_path
            ${mediaExtn}, -- media_file_extension
            ${mediaSize}, -- media_file_size_bytes
            ${userEmail}, -- upload_email
            ${UPLOAD_STATUSES.PENDING}, -- upload_status
            ${uploadBatchId}, -- upload_batch_id
            NOW() -- upload_started_at
        );
    `;
}
