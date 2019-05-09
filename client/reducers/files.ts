import { Dispatch } from 'redux';

import {
    filesDelete,
    FILES_LOAD,
    FILES_LOAD_COMPLETE,
    FILES_DELETE,
    FILES_DELETE_COMPLETE,
} from '../actions/files';
import { Action, Dict } from '../types';

export class DirectoryModel {
    readonly name: string;
    readonly title: string;
    readonly path: string;
    readonly numEntries: number;
    readonly id?: number;
    readonly uuid?: string;
    readonly size?: number;
    readonly error?: string;
    readonly entryType?: string;
    readonly mediaType?: string;
    readonly _dispatch?: Dispatch;

    constructor(directory: DirectoryModel) {
        Object.assign(this, directory);
    }
}

export class FileModel {
    readonly id: number;
    readonly uuid: string;
    readonly name: string;
    readonly title: string;
    readonly size: number;
    readonly isDeleting?: boolean = false;
    readonly isDeleted?: boolean = false;
    readonly error?: string = null;
    readonly _dispatch: Dispatch;

    constructor(file: FileModel) {
        Object.assign(this, file);
    }

    delete?(): Action {
        return this._dispatch(filesDelete(this, this._dispatch));
    }

    update?(update: Partial<FileModel>): FileModel {
        const newProps = Object.assign({}, this, update);
        return new FileModel(newProps);
    }
}

export interface FilesState {
    readonly path: string;
    readonly isFetching: boolean;
    readonly hasFetched: boolean;
    readonly errors: ReadonlyArray<string>;
    readonly directoriesByName: Map<string, DirectoryModel>;
    readonly filesById: Map<number, FileModel>;
}

const INITIAL_STATE: FilesState = {
    path: null,
    isFetching: false,
    hasFetched: false,
    errors: [],
    directoriesByName: new Map<string, DirectoryModel>(),
    filesById: new Map<number, FileModel>(),
};


export default function filesReducer(state = INITIAL_STATE, action: Action): FilesState {
    const payload = action.payload;

    switch (action.type) {
        // when client has requested the list of files and directories at the given path
        case FILES_LOAD: {
            const update = {
                isFetching: true,
                directoriesByName: new Map(), // clear dirs from previous state
                filesById: new Map(), // clear files from previous state
                errors: ([] as ReadonlyArray<string>), // clear errors from previous state
            };
            return Object.assign({}, state, update, payload);
        }

        // when client has received the list of files and directories
        case FILES_LOAD_COMPLETE: {
            if (action.error) {
                const update = {
                    isFetching: false,
                    hasFetched: true,
                    errors: [payload.message],
                };
                return Object.assign({}, state, update);
            }
            const update = {
                isFetching: false,
                hasFetched: true,
                errors: ([] as ReadonlyArray<string>), // clear errors
            };
            return Object.assign({}, state, update, payload);
        }

        // client requests to delete file by ID
        case FILES_DELETE: {
            const filesById = new Map([...state.filesById, ...(payload as Dict).filesById]);
            return Object.assign({}, state, { filesById });
        }

        // server acknowledges file has been deleted
        case FILES_DELETE_COMPLETE: {
            const filesById = new Map([...state.filesById, ...(payload as Dict).filesById]);
            return Object.assign({}, state, { filesById });
        }

        default: {
            return state;
        }
    }
}
