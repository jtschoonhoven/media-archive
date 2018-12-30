import urlJoin from 'url-join';
import { Map, OrderedMap } from 'immutable';

import SETTINGS from '../settings';
import { UploadModel } from '../reducers/uploads';

export const UPLOAD_BATCH_START = 'UPLOAD_BATCH_START';
export const UPLOAD_BATCH_SAVED_TO_SERVER = 'UPLOAD_BATCH_SAVED_TO_SERVER';
export const UPLOAD_FILE_TO_S3_START = 'UPLOAD_FILE_TO_S3_START';
export const UPLOAD_FILE_TO_S3_PROGRESS = 'UPLOAD_FILE_TO_S3_PROGRESS';
export const UPLOAD_FILE_TO_S3_FINISHED = 'UPLOAD_FILE_TO_S3_FINISHED';
export const UPLOAD_FILE_TO_S3_RETRY = 'UPLOAD_FILE_TO_S3_RETRY';
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
        .then(response => response.json())
        .then(data => dispatch(_uploadBatchSavedToServer(data, fileList, dispatch)))
        .catch(err => dispatch(_uploadBatchSavedToServer({ error: err.message })));

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
    // populate an OrderedMap of uploadsById with dispatch and raw file object attached
    const uploadsById = OrderedMap(loadResponse.uploads.map((uploadInfo) => {
        uploadInfo.dispatch = dispatch;
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
    const xhr = new XMLHttpRequest();

    uploadModel = uploadModel.merge({
        status: UPLOAD_STATUSES.RUNNING,
        isUploading: true,
        isUploaded: false,
        isDeleting: false,
        isDeleted: false,
        uploadPercent: 0,
        xhrRequest: xhr,
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
        xhr.open('POST', uploadUrl);
        xhr.onload = event => resolve(event.target.responseText);
        xhr.onerror = reject.bind(null, xhr.statusText);
        xhr.upload.onprogress = e => dispatch(_uploadFileToS3Progress(uploadModel, e));
        xhr.send(formData);
    })
        .then(() => {
            dispatch(_uploadFileToS3Finished(uploadModel, null, dispatch));
        })
        .catch((err) => {
            const uploadError = new Error(err);
            dispatch(_uploadFileToS3Finished(uploadModel, uploadError, dispatch));
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
    }

    fetch(urlJoin('/api/v1/uploads/', uploadModel.id.toString()), {
        method: 'PUT',
        body: JSON.stringify({ status: uploadModel.status }),
        headers: POST_HEADERS,
    })
        .then(response => response.json())
        .then(data => dispatch(_uploadFileComplete(data, uploadModel)))
        .catch(err => dispatch(_uploadFileComplete({ error: err.message }, uploadModel)));

    return {
        type: UPLOAD_FILE_TO_S3_FINISHED,
        payload: Map({ uploadsById: OrderedMap([[uploadModel.id, uploadModel]]) }),
    };
}

function _uploadFileComplete(response, uploadModel) {
    if (response.error) {
        uploadModel = uploadModel.merge({
            isUploading: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: `Error while finalizing upload: ${response.error}.`,
        });
    }
    else if (uploadModel.error) {
        uploadModel = uploadModel.merge({
            isUploading: false,
        });
    }
    else {
        uploadModel = uploadModel.merge({
            status: UPLOAD_STATUSES.SUCCESS,
            isUploading: false,
            isUploaded: true,
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
    if (uploadModel.xhrRequest && uploadModel.xhrRequest.readyState !== 4) {
        uploadModel.xhrRequest.abort();
    }
    uploadModel = uploadModel.merge({ isDeleting: true, status: UPLOAD_STATUSES.ABORTED });
    fetch(urlJoin('/api/v1/uploads/', uploadModel.id.toString()), { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(_uploadCancelComplete(data, uploadModel)))
        .catch(err => dispatch(_uploadCancelComplete({ error: err.message }, uploadModel)));
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
