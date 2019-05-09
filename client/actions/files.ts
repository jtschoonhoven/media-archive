import urlJoin from 'url-join';
import { Dispatch } from 'redux';

import SETTINGS from '../settings';
import { DirectoryModel, FileModel } from '../reducers/files';

import { Action } from '../types';

export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';
export const FILES_DELETE = 'FILES_DELETE';
export const FILES_DELETE_COMPLETE = 'FILES_DELETE_COMPLETE';

const FILES_API_URL = SETTINGS.API_URLS.FILES;
const DIRECTORY_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.DIRECTORY;
const FILE_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.FILE;

interface LoadResponse {
    readonly error: string;
    results?: ReadonlyArray<{
        readonly id: number;
        readonly uuid: string;
        readonly path: string;
        readonly name: string;
        readonly title: string;
        readonly size: number;
        readonly entryType: string;
        readonly mediaType: string;
        readonly numEntries: number;
        _dispatch: Dispatch;
    }>;
}

interface DeleteResponse {
    error?: string;
}


/*
 * The Files API returns an array of all directory contents, but we need a separate object
 * for each type of item (directory and file).
 */
function _parseLoadResponse(loadResponse: LoadResponse, dispatch: Dispatch) {
    const directoriesByName = new Map<string, DirectoryModel>();
    const filesById = new Map<number, FileModel>();

    loadResponse.results.forEach((entry) => {
        entry._dispatch = dispatch;

        if (entry.entryType === DIRECTORY_TYPE) {
            const directoryModel = new DirectoryModel({ _dispatch: dispatch, ...entry });
            directoriesByName.set(entry.name, directoryModel);
        }
        else if (entry.entryType === FILE_TYPE) {
            filesById.set(entry.id, new FileModel(entry));
        }
    });
    return { directoriesByName, filesById };
}

/*
 * Fetch the contents of the directory at `path` from the server.
 */
export function load(path: string, dispatch: Dispatch): Action {
    // remove leading and trailing slashes
    path = path.startsWith('/') ? path.slice(1) : path;
    path = path.endsWith('/') ? path.slice(0, -1) : path;

    fetch(urlJoin('/api/v1/files/', path))
        .then(response => response.json())
        .then(data => dispatch(_loadComplete(data, dispatch)))
        .catch(err => dispatch(_loadComplete({ error: err.message }, dispatch)));

    return {
        type: FILES_LOAD,
        payload: { path },
    };
}

/*
 * Receive a list of files and directories from the files API as JSON.
 */
function _loadComplete(loadResponse: LoadResponse, dispatch: Dispatch): Action {
    if (loadResponse.error) {
        return {
            type: FILES_LOAD_COMPLETE,
            payload: new Error(loadResponse.error),
            error: true,
        };
    }
    return {
        type: FILES_LOAD_COMPLETE,
        payload: _parseLoadResponse(loadResponse, dispatch),
    };
}

/*
 * Client sends request to delete file by ID.
 */
export function filesDelete(fileModel: FileModel, dispatch: Dispatch): Action {
    fileModel = fileModel.update({ isDeleting: true });

    fetch(urlJoin(FILES_API_URL, fileModel.id.toString()), { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(_fileDeleteComplete(data, fileModel)))
        .catch(err => dispatch(_fileDeleteComplete({ error: err.message }, fileModel)));

    return {
        type: FILES_DELETE,
        payload: { filesById: new Map([[fileModel.id, fileModel]]) },
    };
}

/*
 * Server confirms that file has been deleted.
 */
function _fileDeleteComplete(deleteResponse: DeleteResponse, fileModel: FileModel): Action {
    // NOTE: never returns an error action, but sets error prop on fileModel on failure
    if (deleteResponse.error) {
        fileModel = fileModel.update({
            isDeleting: false,
            error: `Error while deleting ${fileModel.name}: ${deleteResponse.error}.`,
        });
    }
    else {
        fileModel = fileModel.update({
            isDeleting: false,
            isDeleted: true,
            error: null,
        });
    }
    return {
        type: FILES_DELETE_COMPLETE,
        payload: { filesById: new Map([[fileModel.id, fileModel]]) },
    };
}
