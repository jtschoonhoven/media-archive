import urlJoin from 'url-join';
import { Map, OrderedMap } from 'immutable';

import SETTINGS from '../settings';
import { DirectoryModel, FileModel } from '../reducers/files';

export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';

const DIRECTORY_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.DIRECTORY;
const FILE_TYPE = SETTINGS.DIRECTORY_CONTENT_TYPES.FILE;


/*
 * The Files API returns an array of all directory contents, but we need a separate object
 * for each type of item (directory and file).
 */
function parseLoadResponse(loadResponse) {
    const directoriesByName = [];
    const filesById = [];

    loadResponse.results.forEach((entry) => {
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
    fetch(urlJoin('/api/v1/files/', path))
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
 */
function _loadComplete(loadResponse) {
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
