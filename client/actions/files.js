export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';
export const FILES_UPLOAD = 'FILES_UPLOAD';
export const FILES_UPLOAD_ACKNOWLEDGED = 'FILES_UPLOAD_ACKNOWLEDGED';

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
    const payload = isError ? new Error(filesResults.error.toString()) : filesResults;
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
        .catch(err => dispatch(loadComplete({ error: err.toString() })));
    return {
        type: FILES_LOAD,
        payload: { path },
    };
}

/*
 * Server acknowledges upload and returns signed tokens used for direct upload to S3.
 */
export function uploadAcknowledged(uploadsResults) {
    const isError = !!uploadsResults.error;
    const payload = isError ? new Error(uploadsResults.error.toString()) : uploadsResults;
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
        .catch(err => dispatch(uploadAcknowledged({ error: err.toString() })));
    return {
        type: FILES_UPLOAD,
        payload: { path },
    };
}
