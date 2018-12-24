export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';
export const FILES_UPLOAD = 'FILES_UPLOAD';
export const FILES_UPLOAD_ACKNOWLEDGED = 'FILES_UPLOAD_ACKNOWLEDGED';
export const FILES_UPLOAD_CANCEL = 'FILES_UPLOAD_CANCEL';
export const FILES_UPLOAD_CANCEL_COMPLETE = 'FILES_UPLOAD_CANCEL_COMPLETE';
export const FILES_UPLOAD_TO_S3 = 'FILES_UPLOAD_TO_S3';
export const FILES_UPLOAD_TO_S3_COMPLETE = 'FILES_UPLOAD_TO_S3_COMPLETE';

const POST_HEADERS = { 'Content-Type': 'application/json' };

/*
 * Actions must be "standard flux actions".
 * Refer to https://github.com/redux-utilities/flux-standard-action
 */

/*
 * Receive a list of files and directories from the files API as JSON.
 */
export function loadComplete(filesResults) {
    const isError = !!filesResults.error;
    const payload = isError ? new Error(filesResults.error) : filesResults;
    return {
        type: FILES_LOAD_COMPLETE,
        payload,
        error: isError,
    };
}

/*
 * Load all the directories and files at a given path.
 */
export function load(path, dispatch) {
    path = path.startsWith('/') ? path.slice(1) : path; // remove leading slash
    fetch(`/api/v1/files/${path}`)
        .then(response => response.json())
        .then(data => dispatch(loadComplete(data)))
        .catch(err => dispatch(loadComplete({ error: err.message })));
    return {
        type: FILES_LOAD,
        payload: { path },
    };
}

export function uploadFileToS3Complete(filesResults) {
    const isError = !!filesResults.error;
    const payload = isError ? new Error(filesResults.error) : filesResults;
    return {
        type: FILES_UPLOAD_TO_S3_COMPLETE,
        payload,
        error: isError,
    };
}

export function uploadFileToS3(file, uuid, s3AuthConfig, dispatch) {
    // urlencode S3 auth config
    const formData = new FormData();
    Object.keys(s3AuthConfig).forEach((configKey) => {
        const configValue = s3AuthConfig[configKey];
        formData.append(configKey, configValue);
    });
    formData.append('file', file); // this must be added to formData last
    fetch(`https://${SETTINGS.S3_BUCKET_NAME}.s3.amazonaws.com`, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => dispatch(uploadFileToS3Complete(data)))
        .catch(err => dispatch(uploadFileToS3Complete({ error: err.message })));
    return {
        type: FILES_UPLOAD_TO_S3,
        payload: {},
    };
}

/*
 * Server acknowledges upload and returns signed tokens used for direct upload to S3.
 */
export function uploadAcknowledged(uploadsResults) {
    const isError = !!uploadsResults.error;
    const payload = isError ? new Error(uploadsResults.error) : uploadsResults;
    return {
        type: FILES_UPLOAD_ACKNOWLEDGED,
        payload,
        error: isError,
    };
}

/*
 * Upload a list of files to directory at the given path.
 */
export function upload(path, fileList, dispatch) {
    path = path.startsWith('/') ? path.slice(1) : path; // remove leading slash
    const body = JSON.stringify({ files: fileList });
    fetch(`/api/v1/files/${path}`, { method: 'POST', body, headers: POST_HEADERS })
        .then(response => response.json())
        .then(data => dispatch(uploadAcknowledged(data)))
        .catch(err => dispatch(uploadAcknowledged({ error: err.message })));
    return {
        type: FILES_UPLOAD,
        payload: {},
    };
}

/*
 * Server confirms that file has been deleted.
 */
export function uploadCancelComplete(uploadId, uploadsResults) {
    let error;
    const isError = !!uploadsResults.error;
    if (isError) {
        error = new Error(uploadsResults.error);
        error.deletions = [uploadId]; // hack to know which upload failed in case there are several
    }
    const payload = isError ? error : uploadsResults;
    return {
        type: FILES_UPLOAD_CANCEL_COMPLETE,
        payload,
        error: isError,
    };
}

/*
 * Client sends request to delete file by ID.
 */
export function uploadCancel(uploadId, dispatch) {
    fetch(`/api/v1/files/${uploadId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(uploadCancelComplete(uploadId, data)))
        .catch(err => dispatch(uploadCancelComplete(uploadId, { error: err.message })));
    return {
        type: FILES_UPLOAD_CANCEL,
        payload: { id: uploadId },
    };
}
