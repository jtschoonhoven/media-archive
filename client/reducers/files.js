import { List, Map, OrderedMap, Record } from 'immutable';

import { FILES_LOAD, FILES_LOAD_COMPLETE } from '../actions/files';
import { validateAction } from './index';

const FilesState = Record({
    path: null,
    isFetching: false,
    isAcknowledging: false,
    errors: List(),
    directoriesByName: OrderedMap(),
    filesById: OrderedMap(),
});

export class DirectoryModel extends Record({
    name: null,
    path: null,
    numEntries: 0,
}) {}

export class FileModel extends Record({
    id: null,
    uuid: null,
    name: null,
    size: null,
    isDeleting: false,
    isDeleted: false,
}) {}


export default function filesReducer(state = FilesState(), action) {
    validateAction(state, action);
    const payload = action.payload;

    switch (action.type) {
        // when client has requested the list of files and directories at the given path
        case FILES_LOAD: {
            const update = Map({
                isFetching: true,
                errors: List(),
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

        default: {
            return state;
        }
    }
}
