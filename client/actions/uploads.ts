import PromisePool from 'es6-promise-pool';
import urlJoin from 'url-join';
import { Dispatch } from 'redux';

import SETTINGS from '../settings';
import { UploadModel } from '../reducers/uploads';
import { Action } from '../types';

export const UPLOAD_BATCH_START = 'UPLOAD_BATCH_START';
export const UPLOAD_BATCH_SAVED_TO_SERVER = 'UPLOAD_BATCH_SAVED_TO_SERVER';
export const UPLOAD_FILE_TO_S3_START = 'UPLOAD_FILE_TO_S3_START';
export const UPLOAD_FILE_TO_S3_PROGRESS = 'UPLOAD_FILE_TO_S3_PROGRESS';
export const UPLOAD_FILE_TO_S3_FINISHED = 'UPLOAD_FILE_TO_S3_FINISHED';
export const UPLOAD_FILE_TO_S3_RETRY = 'UPLOAD_FILE_TO_S3_RETRY';
export const UPLOAD_FILE_COMPLETE = 'UPLOAD_FILE_COMPLETE';
export const UPLOAD_FILE_CANCEL = 'UPLOAD_FILE_CANCEL';
export const UPLOAD_FILE_CANCEL_COMPLETE = 'UPLOAD_FILE_CANCEL_COMPLETE';
export const UPLOAD_RESET = 'UPLOAD_RESET';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const POST_HEADERS = { 'Content-Type': 'application/json' };
const UPLOAD_CONCURRENCY = 4;

export type UploadsMap = Map<number, UploadModel>;

interface UploadResponse {
    readonly error?: string;
    readonly uploads?: ReadonlyArray<UploadModel>;
}


/*
 * Upload a list of files to directory at the given path.
 *
 * :path:     path to upload files to, e.g. /uploads (leading and trailing slashes are stripped)
 * :fileList: an instance of FileList, containing raw File objects for upload
 * :dispatch: function to dispatch a redux action
 */
export function upload(path: string, fileList: File[], dispatch: Dispatch): Action {
    // get an array of file metadata from File objects to POST to server
    const filesMetadata = Array.from(fileList).map((file) => {
        return { name: file.name, sizeInBytes: file.size };
    });

    // POST metadata to server (NOT the files themselves, those will go directly to S3)
    const body = JSON.stringify({ files: filesMetadata });
    fetch(urlJoin('/api/v1/uploads/', path), { body, method: 'POST', headers: POST_HEADERS })
        .then(response => response.json())
        .then(data => dispatch(_uploadBatchSavedToServer(data, fileList, dispatch)))
        .catch(err => dispatch(_uploadBatchSavedToServer({ error: err.message })));

    return {
        type: UPLOAD_BATCH_START,
        payload: {},
    };
}

/*
 * Server acknowledges upload and returns signed tokens used for direct upload to S3.
 *
 * :loadResponse: results of a Files API GET for the current directory
 * :fileList:     an instance of FileList, containing raw File objects for upload
 * :dispatch:     function to dispatch a redux action
 */
function _uploadBatchSavedToServer(
    loadResponse: UploadResponse,
    fileList?: File[],
    dispatch?: Dispatch,
): Action {
    if (loadResponse.error) {
        return {
            type: UPLOAD_BATCH_SAVED_TO_SERVER,
            payload: new Error(loadResponse.error),
            error: true,
        };
    }

    const uploadsById: UploadsMap = new Map<number, UploadModel>();

    // populate an ordered Map of uploadsById with dispatch and raw file object attached
    loadResponse.uploads.forEach((uploadInfo: UploadModel): void => {
        const file = Array.from(fileList).find((fileItem: File): boolean => {
            return fileItem.name === uploadInfo.nameUnsafe;
        });
        const uploadModel = new UploadModel({
            file,
            _dispatch: dispatch,
            status: UPLOAD_STATUSES.RUNNING,
            ...uploadInfo,
        });
        uploadsById.set(uploadInfo.id, uploadModel);
    });

    // start uploads to S3 with concurrency managed by a PromisePool
    function getNextUploadPromiseFactory(): () => Promise<void> {
        const uploadModelsIterator = uploadsById.values();
        return () => {
            const iter = uploadModelsIterator.next();
            if (iter.done) {
                return null;
            }
            const uploadModel = iter.value;
            const action = dispatch(uploadFileToS3(uploadModel, dispatch));
            return action.meta.uploadPromise;
        };
    }
    new PromisePool(getNextUploadPromiseFactory(), UPLOAD_CONCURRENCY).start();

    return {
        type: UPLOAD_BATCH_SAVED_TO_SERVER,
        payload: { uploadsById },
    };
}

/*
 * Upload a single file to S3.
 */
export function uploadFileToS3(
    uploadModel: UploadModel,
    dispatch: Dispatch,
): Action {
    const xhr = new XMLHttpRequest();

    uploadModel = uploadModel.update({
        error: null,
        status: UPLOAD_STATUSES.RUNNING,
        isUploading: true,
        isUploaded: false,
        isDeleting: false,
        isDeleted: false,
        uploadPercent: 0,
        _xhrRequest: xhr,
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
    const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = e => resolve();
        xhr.onerror = reject;
        xhr.upload.onprogress = e => dispatch(_uploadFileToS3Progress(uploadModel, e));
    })
        .then(() => {
            if (xhr.readyState !== 4) {
                throw new Error('connection was interrupted before upload completed');
            }
            if (xhr.status !== 201) {
                throw new Error(`S3 rejected upload with status "${xhr.statusText}"`);
            }
            dispatch(_uploadFileToS3Finished(uploadModel, null, dispatch));
        })
        .catch((err) => {
            const message = err.message || xhr.statusText || 'Server Error';
            const uploadError = new Error(`Upload failed: ${message}`);
            dispatch(_uploadFileToS3Finished(uploadModel, uploadError, dispatch));
        });

    // use setTimeout to allow this action to complete before upload begins
    setTimeout(
        () => {
            xhr.open('POST', uploadUrl);
            xhr.send(formData);
        },
        0,
    );

    return {
        type: UPLOAD_FILE_TO_S3_START,
        payload: { uploadsById: new Map([[uploadModel.id, uploadModel]]) },
        meta: { uploadPromise }, // used by _uploadBatchSavedToServer to manage concurrency
    };
}

function _uploadFileToS3Progress(
    uploadModel: UploadModel,
    xhrProgressEvent,
): Action {
    const bytesLoaded = xhrProgressEvent.loaded;
    const bytesTotal = xhrProgressEvent.total;
    const uploadPercent = Math.round(bytesLoaded / bytesTotal * 100);
    uploadModel = uploadModel.update({ uploadPercent });
    return {
        type: UPLOAD_FILE_TO_S3_PROGRESS,
        payload: { uploadsById: new Map([[uploadModel.id, uploadModel]]) },
    };
}

function _uploadFileToS3Finished(
    uploadModel: UploadModel,
    uploadError: Error,
    dispatch: Dispatch,
): Action {
    // NOTE: never returns an error action, but sets error prop on uploadModel on failure
    let uploadStatus;

    if (uploadError) {
        uploadStatus = UPLOAD_STATUSES.FAILURE;
        uploadModel = uploadModel.update({
            isUploading: false,
            status: uploadStatus,
            error: uploadError.message,
        });
    }
    else {
        uploadStatus = UPLOAD_STATUSES.SUCCESS;
        uploadModel = uploadModel.update({ uploadPercent: 100 });
    }

    fetch(urlJoin('/api/v1/uploads/', uploadModel.id.toString()), {
        method: 'PUT',
        body: JSON.stringify({ status: uploadStatus }),
        headers: POST_HEADERS,
    })
        .then(response => response.json())
        .then(data => dispatch(_uploadFileComplete(data, uploadModel)))
        .catch(err => dispatch(_uploadFileComplete({ error: err.message }, uploadModel)));

    return {
        type: UPLOAD_FILE_TO_S3_FINISHED,
        payload: { uploadsById: new Map([[uploadModel.id, uploadModel]]) },
    };
}

function _uploadFileComplete(response: UploadResponse, uploadModel: UploadModel): Action {
    if (response.error) {
        uploadModel = uploadModel.update({
            isUploading: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: `Error while finalizing upload: ${response.error}.`,
        });
    }
    else if (uploadModel.error) {
        uploadModel = uploadModel.update({
            isUploading: false,
        });
    }
    else {
        uploadModel = uploadModel.update({
            status: UPLOAD_STATUSES.SUCCESS,
            isUploading: false,
            isUploaded: true,
        });
    }
    return {
        type: UPLOAD_FILE_COMPLETE,
        payload: { uploadsById: new Map([[uploadModel.id, uploadModel]]) },
    };
}

/*
 * Client sends request to delete file by ID.
 */
export function uploadCancel(uploadModel: UploadModel, dispatch: Dispatch): Action {
    if (uploadModel._xhrRequest && uploadModel._xhrRequest.readyState !== 4) {
        uploadModel._xhrRequest.abort();
    }
    uploadModel = uploadModel.update({ isDeleting: true, status: UPLOAD_STATUSES.ABORTED });
    fetch(urlJoin('/api/v1/uploads/', uploadModel.id.toString()), { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(_uploadCancelComplete(data, uploadModel)))
        .catch(err => dispatch(_uploadCancelComplete({ error: err.message }, uploadModel)));
    return {
        type: UPLOAD_FILE_CANCEL,
        payload: { uploadsById: new Map([[uploadModel.id, uploadModel]]) },
    };
}

/*
 * Server confirms that file has been deleted.
 */
function _uploadCancelComplete(cancelResponse: UploadResponse, uploadModel: UploadModel): Action {
    // NOTE: never returns an error action, but sets error prop on uploadModel on failure
    if (cancelResponse.error) {
        uploadModel = uploadModel.update({
            isDeleting: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: `Error while canceling ${uploadModel.name}: ${cancelResponse.error}.`,
        });
    }
    else {
        uploadModel = uploadModel.update({
            isDeleting: false,
            isDeleted: true,
            error: null,
        });
    }
    return {
        type: UPLOAD_FILE_CANCEL_COMPLETE,
        payload: { uploadsById: new Map([[uploadModel.id, uploadModel]]) },
    };
}

/**
 * Empty uploadsById. Called when all uploads are completed.
 */
export function uploadsReset(): Action {
    return {
        type: UPLOAD_RESET,
        payload: {},
    };
}
