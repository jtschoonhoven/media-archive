import urlJoin from 'url-join';
import { Map, OrderedMap } from 'immutable';

import SETTINGS from '../settings';
import { UploadModel } from '../reducers/uploads';

export const UPLOAD_BATCH_START = 'UPLOAD_BATCH_START';
export const UPLOAD_BATCH_SAVED_TO_SERVER = 'UPLOAD_BATCH_SAVED_TO_SERVER';
export const UPLOAD_FILE_TO_S3_START = 'UPLOAD_FILE_TO_S3_START';
export const UPLOAD_FILE_TO_S3_PROGRESS = 'UPLOAD_FILE_TO_S3_PROGRESS';
export const UPLOAD_FILE_TO_S3_FINISHED = 'UPLOAD_FILE_TO_S3_FINISHED';
export const UPLOAD_FILE_COMPLETE = 'UPLOAD_FILE_COMPLETE';
export const UPLOAD_FILE_CANCEL = 'UPLOAD_FILE_CANCEL';
export const UPLOAD_FILE_CANCEL_COMPLETE = 'UPLOAD_FILE_CANCEL_COMPLETE';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const POST_HEADERS = { 'Content-Type': 'application/json' };


/*
 * Upload a list of files to directory at the given path.
 *
 * :path:     path to upload files to, e.g. /uploads (leading and trailing slashes are stripped)
 * :fileList: an instance of FileList, containing raw File objects for upload
 * :dispatch: function to dispatch a redux action
 */
export function upload(path, fileList, dispatch) {
    // get an array of file metadata from File objects to POST to server
    const filesMetadata = Array.from(fileList).map((file) => {
        return { name: file.name, sizeInBytes: file.size };
    });

    // POST metadata to server (NOT the files themselves, those will go directly to S3)
    const body = JSON.stringify({ files: filesMetadata });
    fetch(urlJoin('/api/v1/uploads/', path), { method: 'POST', body, headers: POST_HEADERS })
        .catch(err => dispatch(_uploadBatchSavedToServer({ error: err.message })))
        .then(response => response.json())
        .then(data => dispatch(_uploadBatchSavedToServer(data, fileList, dispatch)));

    return {
        type: UPLOAD_BATCH_START,
        payload: Map(),
    };
}

/*
 * Server acknowledges upload and returns signed tokens used for direct upload to S3.
 *
 * :loadResponse: results of a Files API GET for the current directory
 * :fileList:     an instance of FileList, containing raw File objects for upload
 * :dispatch:     function to dispatch a redux action
 */
function _uploadBatchSavedToServer(loadResponse, fileList, dispatch) {
    if (loadResponse.error) {
        return {
            type: UPLOAD_BATCH_SAVED_TO_SERVER,
            payload: new Error(loadResponse.error),
            error: true,
        };
    }
    // populate an OrderedMap of uploadsById with the raw file object attached
    const uploadsById = OrderedMap(loadResponse.uploads.map((uploadInfo) => {
        uploadInfo.file = Array.from(fileList).find((fileItem) => {
            return fileItem.name === uploadInfo.nameUnsafe;
        });
        return [uploadInfo.id, new UploadModel(uploadInfo)];
    }));

    // begin uploading each file individually
    // FIXME: this should limit the number of concurrent uploads
    uploadsById.forEach((uploadModel) => {
        uploadFileToS3(uploadModel, dispatch);
    });

    return {
        type: UPLOAD_BATCH_SAVED_TO_SERVER,
        payload: Map({ uploadsById }),
        error: false,
    };
}

export function uploadFileToS3(uploadModel, dispatch) {
    uploadModel = uploadModel.merge({
        isUploading: true,
        status: UPLOAD_STATUSES.RUNNING,
        error: null,
    });

    const file = uploadModel.file;
    const uploadPolicy = uploadModel.s3UploadPolicy;
    const uploadUrl = uploadModel.s3UploadUrl;

    // urlencode S3 auth config with file
    const formData = new FormData();
    Object.keys(uploadPolicy).forEach((configKey) => {
        const configValue = uploadPolicy[configKey];
        formData.append(configKey, configValue);
    });
    formData.append('file', file);

    // Fetch doesn't support progress events, so fall back to XHR
    // based on github.com/github/fetch/issues/89#issuecomment-256610849
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.onload = event => resolve(event.target.responseText);
        xhr.onerror = reject.bind(null, xhr);
        xhr.upload.onprogress = e => dispatch(_uploadFileToS3Progress(uploadModel, e));
        xhr.send(formData);
    })
        .catch((xhr) => {
            const uploadError = new Error(xhr.statusText);
            dispatch(_uploadFileToS3Finished(uploadModel, uploadError, dispatch));
        })
        .then(() => {
            dispatch(_uploadFileToS3Finished(uploadModel, null, dispatch));
        });

    return {
        type: UPLOAD_FILE_TO_S3_START,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}

function _uploadFileToS3Progress(uploadModel, xhrProgressEvent) {
    const bytesLoaded = xhrProgressEvent.loaded;
    const bytesTotal = xhrProgressEvent.total;
    const uploadPercent = Math.round(bytesLoaded / bytesTotal * 100);
    uploadModel = uploadModel.set('uploadPercent', uploadPercent);
    return {
        type: UPLOAD_FILE_TO_S3_PROGRESS,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}

function _uploadFileToS3Finished(uploadModel, uploadError, dispatch) {
    // NOTE: never returns an error action, but sets error prop on uploadModel on failure
    if (uploadError) {
        uploadModel = uploadModel.merge({
            isUploading: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: uploadError.message,
        });
    }
    else {
        uploadModel = uploadModel.merge({ uploadPercent: 100 });
        fetch(urlJoin('/api/v1/uploads/', uploadModel.id.toString()), {
            method: 'PUT',
            body: JSON.stringify({ status: UPLOAD_STATUSES.SUCCESS }),
            headers: POST_HEADERS,
        })
            .catch(err => dispatch(_uploadFileComplete({ error: err.message }, uploadModel)))
            .then(response => response.json())
            .then(data => dispatch(_uploadFileComplete(data, uploadModel)));
    }
    return {
        type: UPLOAD_FILE_TO_S3_FINISHED,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}

function _uploadFileComplete(cancelResponse, uploadModel) {
    // NOTE: never returns an error action, but sets error prop on uploadEntry on failure
    if (cancelResponse.error) {
        uploadModel = uploadModel.merge({
            isUploading: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: `Error while canceling ${uploadModel.name}: ${cancelResponse.error}.`,
        });
    }
    else {
        uploadModel = uploadModel.merge({
            isUploading: false,
            isUploaded: true,
            status: UPLOAD_STATUSES.SUCCESS,
            error: null,
        });
    }
    return {
        type: UPLOAD_FILE_COMPLETE,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}

/*
 * Client sends request to delete file by ID.
 */
export function uploadCancel(uploadModel, dispatch) {
    uploadModel = uploadModel.merge({ isDeleting: true, status: UPLOAD_STATUSES.ABORTED });
    fetch(urlJoin('/api/v1/uploads/', uploadModel.id.toString()), { method: 'DELETE' })
        .catch(err => dispatch(_uploadCancelComplete({ error: err.message }, uploadModel)))
        .then(response => response.json())
        .then(data => dispatch(_uploadCancelComplete(data, uploadModel)));
    return {
        type: UPLOAD_FILE_CANCEL,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}

/*
 * Server confirms that file has been deleted.
 */
export function _uploadCancelComplete(cancelResponse, uploadModel) {
    // NOTE: never returns an error action, but sets error prop on uploadModel on failure
    if (cancelResponse.error) {
        uploadModel = uploadModel.merge({
            isDeleting: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: `Error while canceling ${uploadModel.name}: ${cancelResponse.error}.`,
        });
    }
    else {
        uploadModel = uploadModel.merge({
            isDeleting: false,
            isDeleted: true,
            error: false,
        });
    }
    return {
        type: UPLOAD_FILE_CANCEL_COMPLETE,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}
