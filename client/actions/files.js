import urlJoin from 'url-join';
import { Map, OrderedMap } from 'immutable';

import SETTINGS from '../settings';
import { DirectoryModel, FileModel } from '../reducers/files';

export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';
export const FILES_DELETE = 'FILES_DELETE';
export const FILES_DELETE_COMPLETE = 'FILES_DELETE_COMPLETE';

const FILES_API_URL = SETTINGS.API_URLS.FILES;
const DIRECTORY_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.DIRECTORY;
const FILE_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.FILE;


/*
 * The Files API returns an array of all directory contents, but we need a separate object
 * for each type of item (directory and file).
 */
function parseLoadResponse(loadResponse, dispatch) {
    const directoriesByName = [];
    const filesById = [];

    loadResponse.results.forEach((entry) => {
        entry._dispatch = dispatch;
        if (entry.entryType === DIRECTORY_TYPE) {
            directoriesByName.push([entry.name, new DirectoryModel(entry)]);
        }
        else if (entry.entryType === FILE_TYPE) {
            filesById.push([entry.id, new FileModel(entry)]);
        }
    });
    return Map({
        directoriesByName: OrderedMap(directoriesByName),
        filesById: OrderedMap(filesById),
    });
}

/*
 * Fetch the contents of the directory at `path` from the server.
 */
export function load(path, dispatch) {
    // remove leading and trailing slashes
    path = path.startsWith('/') ? path.slice(1) : path;
    path = path.endsWith('/') ? path.slice(0, -1) : path;

    fetch(urlJoin('/api/v1/files/', path))
        .then(response => response.json())
        .then(data => dispatch(_loadComplete(data, dispatch)))
        .catch(err => dispatch(_loadComplete({ error: err.message }, dispatch)));

    return {
        type: FILES_LOAD,
        payload: Map({ path }),
    };
}

/*
 * Receive a list of files and directories from the files API as JSON.
 */
function _loadComplete(loadResponse, dispatch) {
    if (loadResponse.error) {
        return {
            type: FILES_LOAD_COMPLETE,
            payload: new Error(loadResponse.error),
            error: true,
        };
    }
    return {
        type: FILES_LOAD_COMPLETE,
        payload: parseLoadResponse(loadResponse, dispatch),
    };
}

/*
 * Client sends request to delete file by ID.
 */
export function filesDelete(fileModel, dispatch) {
    fileModel = fileModel.merge({ isDeleting: true });

    fetch(urlJoin(FILES_API_URL, fileModel.id.toString()), { method: 'DELETE' })
        .then(response => response.json())
        .then(data => dispatch(_fileDeleteComplete(data, fileModel)))
        .catch(err => dispatch(_fileDeleteComplete({ error: err.message }, fileModel)));

    return {
        type: FILES_DELETE,
        payload: Map({ filesById: OrderedMap([[fileModel.id, fileModel]]) }),
    };
}

/*
 * Server confirms that file has been deleted.
 */
function _fileDeleteComplete(deleteResponse, fileModel) {
    // NOTE: never returns an error action, but sets error prop on fileModel on failure
    if (deleteResponse.error) {
        fileModel = fileModel.merge({
            isDeleting: false,
            error: `Error while deleting ${fileModel.name}: ${deleteResponse.error}.`,
        });
    }
    else {
        fileModel = fileModel.merge({
            isDeleting: false,
            isDeleted: true,
            error: false,
        });
    }
    return {
        type: FILES_DELETE_COMPLETE,
        payload: Map({ filesById: OrderedMap([[fileModel.id, fileModel]]) }),
    };
}
