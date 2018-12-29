import { Map, OrderedMap, Record } from 'immutable';

import {
    FILES_LOAD,
    FILES_LOAD_COMPLETE,
    FILES_UPLOAD,
    FILES_UPLOAD_ACKNOWLEDGED,
    FILES_UPLOAD_CANCEL,
    FILES_UPLOAD_CANCEL_COMPLETE,
    FILES_UPLOAD_TO_S3,
    FILES_UPLOAD_TO_S3_PROGRESS,
    FILES_UPLOAD_TO_S3_COMPLETE,
    FILES_UPLOAD_TO_S3_CONFIRMED,
} from '../actions/files';
import { validateAction } from './index';

const FilesState = Record({
    error: null,
    path: null,
    isFetching: false,
    isAcknowledging: false,
    directoriesByName: OrderedMap(), // { str: DirectoryEntry }
    filesById: OrderedMap(), // { int: FileEntry }
    uploadsById: OrderedMap(), // { int: UploadEntry }
    rawFileObjectsByName: OrderedMap(), // { str: RawFileObjEntry }
});

export const DirectoryEntry = Record({
    name: null,
    path: null,
    numEntries: 0,
});

export const RawFileObjEntry = Record({
    nameUnsafe: null,
    file: null,
    size: null,
});

export const FileEntry = Record({
    id: null,
    uuid: null,
    name: null,
    path: null,
    size: null,
    nameUnsafe: null,
    extension: null,
    isDeleting: false,
    isDeleted: false,
});

export const UploadEntry = Record({
    id: null,
    uuid: null,
    name: null,
    path: null,
    size: null,
    file: null,
    error: null,
    nameUnsafe: null,
    extension: null,
    rawFileObj: null,
    s3UploadPolicy: null,
    s3UploadUrl: null,
    status: 'pending',
    uploadPercent: 0,
    isUploading: false,
    isUploaded: false,
    isDeleting: false,
    isDeleted: false,
});

export default function filesReducer(state = FilesState(), action) {
    validateAction(state, action);
    const payload = action.payload;

    switch (action.type) {
        // when client has requested the list of files and directories at the given path
        case FILES_LOAD: {
            const update = Map({ isFetching: true, error: null });
            return state.merge(update, payload);
        }

        // when client has received the list of files and directories
        case FILES_LOAD_COMPLETE: {
            if (action.error) {
                return state.merge({ isFetching: false, error: payload.message });
            }
            const update = Map({ isFetching: false, error: null });
            return state.merge(update, payload);
        }

        // when client sends initial list of file descriptors to server
        case FILES_UPLOAD: {
            const oldFiles = state.get('rawFileObjectsByName');
            const newFiles = payload.get('rawFileObjectsByName');
            const update = Map({
                isAcknowledging: true,
                rawFileObjectsByName: oldFiles.merge(newFiles),
                error: null,
            });
            return state.merge(update);
        }

        // server acknowledges receipt of file descriptors and returns upload tokens
        case FILES_UPLOAD_ACKNOWLEDGED: {
            if (action.error) {
                const update = Map({ isAcknowledging: false, error: payload.message });
                return state.merge(update);
            }
            const update = Map({ isAcknowledging: false });
            return state.merge(update, payload);
        }

        case FILES_UPLOAD_TO_S3: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case FILES_UPLOAD_TO_S3_PROGRESS: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case FILES_UPLOAD_TO_S3_COMPLETE: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case FILES_UPLOAD_TO_S3_CONFIRMED: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        // client requests to delete file by ID
        case FILES_UPLOAD_CANCEL: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        // server acknowledges file has been deleted
        case FILES_UPLOAD_CANCEL_COMPLETE: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        default: {
            return state;
        }
    }
}
