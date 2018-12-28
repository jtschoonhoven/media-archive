import { Map, OrderedMap } from 'immutable';

import SETTINGS from '../settings';
import { DirectoryEntry, FileEntry, RawFileObjEntry, UploadEntry } from '../reducers/files';

export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';
export const FILES_UPLOAD = 'FILES_UPLOAD';
export const FILES_UPLOAD_ACKNOWLEDGED = 'FILES_UPLOAD_ACKNOWLEDGED';
export const FILES_UPLOAD_CANCEL = 'FILES_UPLOAD_CANCEL';
export const FILES_UPLOAD_CANCEL_COMPLETE = 'FILES_UPLOAD_CANCEL_COMPLETE';
export const FILES_UPLOAD_TO_S3 = 'FILES_UPLOAD_TO_S3';
export const FILES_UPLOAD_TO_S3_COMPLETE = 'FILES_UPLOAD_TO_S3_COMPLETE';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const DIRECTORY_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.DIRECTORY;
const FILE_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.FILE;
const UPLOAD_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.UPLOAD;

const POST_HEADERS = { 'Content-Type': 'application/json' };


/*
 * The Files API returns an array of all directory contents, but we need a separate object
 * for each type of item (directory, file, or upload).
 *
 * NOTE: does NOT check for an error response.
 */
function parseLoadResponse(loadResponse) {
    const directoriesByName = [];
    const filesById = [];
    const uploadsById = [];

    loadResponse.results.forEach((entry) => {
        if (entry.type === DIRECTORY_TYPE) {
            directoriesByName.push([entry.name, DirectoryEntry(entry)]);
        }
        else if (entry.type === FILE_TYPE) {
            filesById.push([entry.id, FileEntry(entry)]);
        }
        else if (entry.type === UPLOAD_TYPE) {
            uploadsById.push([entry.id, UploadEntry(entry)]);
        }
    });
    return Map({
        directoriesByName: OrderedMap(directoriesByName),
        filesById: OrderedMap(filesById),
        uploadsById: OrderedMap(uploadsById),
    });
}

/*
 * Load all the directories and files at a given path.
 */
export function load(path, dispatch) {
    path = path.startsWith('/') ? path.slice(1) : path; // remove leading slash
    path = path.endsWith('/') ? path.slice(0, -1) : path; // remove trailing slash
    fetch(`/api/v1/files/${path}`)
        .then(response => response.json())
        .then(data => dispatch(_loadComplete(data)))
        .catch(err => dispatch(_loadComplete({ error: err.message })));
    return {
        type: FILES_LOAD,
        payload: Map({ path }),
    };
}

/*
 * Receive a list of files and directories from the files API as JSON.
 * This is called automatically by the FILES_LOAD action and should not be used elsewhere.
 */
export function _loadComplete(loadResponse) {
    if (loadResponse.error) {
        return {
            type: FILES_LOAD_COMPLETE,
            payload: new Error(loadResponse.error),
            error: true,
        };
    }
    return {
        type: FILES_LOAD_COMPLETE,
        payload: parseLoadResponse(loadResponse),
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
    path = path.startsWith('/') ? path.slice(1) : path; // remove leading slashes from path
    path = path.endsWith('/') ? path.slice(0, -1) : path; // remove trailing slashes from path

    // get an OrderedMap of raw files objects keyed by file name
    const _rawFileObjectsByName = [];
    Array.from(fileList).forEach((file) => {
        const entry = RawFileObjEntry({ nameUnsafe: file.name, size: file.size, file });
        _rawFileObjectsByName.push([file.name, entry]);
    });
    const rawFileObjectsByName = OrderedMap(_rawFileObjectsByName);

    // get an array of file metadata from File objects
    const fileMetadataArray = Array.from(fileList).map((file) => {
        return { name: file.name, sizeInBytes: file.size };
    });

    // POST metadata to server (NOT the files themselves, those will go directly to S3)
    const body = JSON.stringify({ files: fileMetadataArray });
    fetch(`/api/v1/files/${path}`, { method: 'POST', body, headers: POST_HEADERS })
        .then(response => response.json())
        .then(data => dispatch(_uploadAcknowledged(data, rawFileObjectsByName, dispatch)))
        .catch(err => dispatch(_uploadAcknowledged({ error: err.message })));

    // save array of *actual* File objects to state
    return {
        type: FILES_UPLOAD,
        payload: Map({ rawFileObjectsByName }),
    };
}

/*
 * Server acknowledges upload and returns signed tokens used for direct upload to S3.
 * This is called automatically by the UPLOAD action and should not be used elsewhere.
 *
 * loadResponse:         results of a Files API GET for the current directory
 * rawFileObjectsByName: OrderedMap of raw File objects pending upload
 * dispatch:             function to dispatch a redux action
 */
export function _uploadAcknowledged(loadResponse, rawFileObjectsByName, dispatch) {
    if (loadResponse.error) {
        return {
            type: FILES_UPLOAD_ACKNOWLEDGED,
            payload: new Error(loadResponse.error),
            error: true,
        };
    }
    let loadResults = parseLoadResponse(loadResponse);
    let uploadsById = loadResults.get('uploadsById');

    // match each upload item to a raw File object and initiate upload to S3
    uploadsById = uploadsById.map((uploadEntry) => {
        const rawFileObjEntry = rawFileObjectsByName.get(uploadEntry.nameUnsafe);
        if (!rawFileObjEntry) {
            if (uploadEntry.status === UPLOAD_STATUSES.PENDING) {
                uploadEntry = uploadEntry.merge({
                    status: UPLOAD_STATUSES.FAILURE,
                    error: 'Connection was lost before upload completed.',
                });
            }
            return uploadEntry;
        }
        uploadEntry = uploadEntry.set('file', rawFileObjEntry.file);
        dispatch(uploadFileToS3(uploadEntry, dispatch));
        return uploadEntry;
    });
    loadResults = loadResults.set('uploadsById', uploadsById);

    return {
        type: FILES_UPLOAD_ACKNOWLEDGED,
        payload: loadResults,
        error: false,
    };
}

export function uploadFileToS3(uploadEntry, dispatch) {
    uploadEntry = uploadEntry.set('status', UPLOAD_STATUSES.RUNNING);

    const file = uploadEntry.file;
    const uploadPolicy = uploadEntry.s3UploadPolicy;
    const uploadUrl = uploadEntry.s3UploadUrl;

    // urlencode S3 auth config with file
    const formData = new FormData();
    Object.keys(uploadPolicy).forEach((configKey) => {
        const configValue = uploadPolicy[configKey];
        formData.append(configKey, configValue);
    });
    formData.append('file', file);

    // POST file to S3 with auth
    let uploadError;
    fetch(uploadUrl, { method: 'POST', body: formData })
        .then((res) => {
            uploadError = !res.ok ? new Error(res.statusText) : null;
        })
        .catch((err) => {
            uploadError = new Error(err.message);
        })
        .finally(() => {
            dispatch(_uploadFileToS3Complete(uploadEntry, uploadError));
        });

    return {
        type: FILES_UPLOAD_TO_S3,
        payload: Map({ uploadsById: OrderedMap([[uploadEntry.id, uploadEntry]]) }),
    };
}

export function _uploadFileToS3Complete(uploadEntry, uploadError) {
    // NOTE: never returns an error action, but sets error prop on uploadEntry on failure
    if (uploadError) {
        uploadEntry = uploadEntry.merge({
            status: UPLOAD_STATUSES.FAILURE,
            error: uploadError.message,
        });
    }
    else {
        uploadEntry = uploadEntry.set('status', UPLOAD_STATUSES.SUCCESS);
    }
    return {
        type: FILES_UPLOAD_TO_S3_COMPLETE,
        payload: Map({ uploadsById: OrderedMap([[uploadEntry.id, uploadEntry]]) }),
    };
}

/*
 * Client sends request to delete file by ID.
 */
export function uploadCancel(uploadEntry, dispatch) {
    uploadEntry = uploadEntry.merge({ isDeleting: true, status: UPLOAD_STATUSES.ABORTED });
    fetch(`/api/v1/uploads/${uploadEntry.id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(_uploadCancelComplete(data, uploadEntry)))
        .catch(err => dispatch(_uploadCancelComplete({ error: err.message }, uploadEntry)));
    return {
        type: FILES_UPLOAD_CANCEL,
        payload: Map({ uploadsById: OrderedMap([[uploadEntry.id, uploadEntry]]) }),
    };
}

/*
 * Server confirms that file has been deleted.
 */
export function _uploadCancelComplete(cancelResponse, uploadEntry) {
    // NOTE: never returns an error action, but sets error prop on uploadEntry on failure
    if (cancelResponse.error) {
        uploadEntry = uploadEntry.merge({
            isDeleting: false,
            status: UPLOAD_STATUSES.FAILURE,
            error: `Error while canceling ${uploadEntry.name}: ${cancelResponse.error}.`,
        });
    }
    else {
        uploadEntry = uploadEntry.merge({
            isDeleting: false,
            isDeleted: true,
            error: false,
        });
    }
    return {
        type: FILES_UPLOAD_CANCEL_COMPLETE,
        payload: Map({ uploadsById: OrderedMap([[uploadEntry.id, uploadEntry]]) }),
    };
}
