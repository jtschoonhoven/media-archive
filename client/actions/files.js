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
 * This is called automatically by the FILES_LOAD action and should not be used elsewhere.
 */
export function _loadComplete(filesResults) {
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
        .then(data => dispatch(_loadComplete(data)))
        .catch(err => dispatch(_loadComplete({ error: err.message })));
    return {
        type: FILES_LOAD,
        payload: { path },
    };
}

export function _uploadFileToS3Complete(filesResults) {
    const isError = !!filesResults.error;
    const payload = isError ? new Error(filesResults.error) : filesResults;
    return {
        type: FILES_UPLOAD_TO_S3_COMPLETE,
        payload,
        error: isError,
    };
}

export function uploadFileToS3(file, uuid, uploadUrl, uploadPolicy, dispatch) {
    // urlencode S3 auth config
    const formData = new FormData();
    Object.keys(uploadPolicy).forEach((configKey) => {
        const configValue = uploadPolicy[configKey];
        formData.append(configKey, configValue);
    });
    formData.append('file', file);
    fetch(uploadUrl, { method: 'POST', body: formData })
        .then((response) => {
            const data = {};
            if (!response.ok) {
                data.error = response.statusText;
            }
            dispatch(_uploadFileToS3Complete(data));
        })
        .catch(err => dispatch(_uploadFileToS3Complete({ error: err.message })));
    return {
        type: FILES_UPLOAD_TO_S3,
        payload: {},
    };
}

/*
 * Server acknowledges upload and returns signed tokens used for direct upload to S3.
 * This is called automatically by the UPLOAD action and should not be used elsewhere.
 *
 * dirContents: results of a Files API GET for the current directory
 * fileObjects: list of raw File objects pending upload
 * dispatch:    function to dispatch a redux action
 */
export function _uploadAcknowledged(dirContentsQuery, rawFileObjects, dispatch) {
    const isError = !!dirContentsQuery.error;
    if (isError) {
        return {
            type: FILES_UPLOAD_ACKNOWLEDGED,
            payload: new Error(dirContentsQuery.error),
            error: true,
        };
    }

    dirContentsQuery.results.forEach((dirItem) => {
        if (dirItem.type !== 'upload') {
            return;
        }
        const fileObj = rawFileObjects.find((file) => {
            return file.name === dirItem.media_file_name_unsafe;
        });
        if (fileObj) {
            dirItem.file = fileObj;
            dispatch(
                uploadFileToS3(
                    fileObj,
                    dirItem.uuid,
                    dirItem.s3UploadUrl,
                    dirItem.s3UploadPolicy,
                    dispatch,
                ),
            );
        }
    });

    return {
        type: FILES_UPLOAD_ACKNOWLEDGED,
        payload: dirContentsQuery.results,
        error: false,
    };
}

/*
 * Upload a list of files to directory at the given path.
 *
 * path:     path to upload files to, e.g. /uploads (leading and trailing slashes are stripped)
 * fileList: an instance of FileList, containing raw File objects for upload
 * dispatch: function to dispatch a redux action
 */
export function upload(path, fileList, dispatch) {
    // remove leading slash from upload path
    path = path.startsWith('/') ? path.slice(1) : path;

    // get an array of raw File objects from FileList instance
    const fileObjectsArray = Array.from(fileList);

    // get an array of file metadata from File objects
    const fileMetadataArray = fileObjectsArray.map((file) => {
        return { name: file.name, sizeInBytes: file.size };
    });

    // POST metadata to server (NOT the files themselves, those will go directly to S3)
    const body = JSON.stringify({ files: fileMetadataArray });
    fetch(`/api/v1/files/${path}`, { method: 'POST', body, headers: POST_HEADERS })
        .then(response => response.json())
        .then(data => dispatch(_uploadAcknowledged(data, fileObjectsArray, dispatch)))
        .catch(err => dispatch(_uploadAcknowledged({ error: err.message })));

    // save array of *actual* File objects to state
    return {
        type: FILES_UPLOAD,
        payload: {
            uploads: fileObjectsArray,
        },
    };
}

/*
 * Server confirms that file has been deleted.
 */
export function _uploadCancelComplete(uploadId, uploadsResults) {
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
    fetch(`/api/v1/uploads/${uploadId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(_uploadCancelComplete(uploadId, data)))
        .catch(err => dispatch(_uploadCancelComplete(uploadId, { error: err.message })));
    return {
        type: FILES_UPLOAD_CANCEL,
        payload: { id: uploadId },
    };
}
