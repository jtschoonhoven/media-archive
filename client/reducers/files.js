import { List, Map, OrderedMap, Record } from 'immutable';

import {
    filesDelete,
    FILES_LOAD,
    FILES_LOAD_COMPLETE,
    FILES_DELETE,
    FILES_DELETE_COMPLETE,
} from '../actions/files';


const FilesState = Record({
    path: null,
    isFetching: false,
    errors: List(),
    directoriesByName: OrderedMap(),
    filesById: OrderedMap(),
});

export class DirectoryModel extends Record({
    name: null,
    path: null,
    error: null,
    numEntries: 0,
    _dispatch: null,
}) {}

export class FileModel extends Record({
    id: null,
    uuid: null,
    name: null,
    size: null,
    error: null,
    isDeleting: false,
    isDeleted: false,
    _dispatch: null,
}) {
    delete() {
        return this._dispatch(filesDelete(this, this._dispatch));
    }
}

export default function filesReducer(state = FilesState(), action) {
    const payload = action.payload;

    switch (action.type) {
        // when client has requested the list of files and directories at the given path
        case FILES_LOAD: {
            const update = Map({
                isFetching: true,
                directoriesByName: OrderedMap(), // clear dirs from previous state
                filesById: OrderedMap(), // clear files from previous state
                errors: List(), // clear errors from previous state
            });
            return state.merge(update, payload);
        }

        // when client has received the list of files and directories
        case FILES_LOAD_COMPLETE: {
            if (action.error) {
                return state.merge({
                    isFetching: false,
                    errors: List([payload.message]),
                });
            }
            const update = Map({
                isFetching: false,
                error: List(),
            });
            return state.merge(update, payload);
        }

        // client requests to delete file by ID
        case FILES_DELETE: {
            const filesById = state.filesById.merge(payload.get('filesById'));
            return state.merge({ filesById });
        }

        // server acknowledges file has been deleted
        case FILES_DELETE_COMPLETE: {
            const filesById = state.filesById.merge(payload.get('filesById'));
            return state.merge({ filesById });
        }

        default: {
            return state;
        }
    }
}
