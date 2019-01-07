import { List, Map, OrderedMap, Record } from 'immutable';

import SETTINGS from '../settings';
import {
    uploadCancel,
    uploadFileToS3,
    UPLOAD_BATCH_START,
    UPLOAD_BATCH_SAVED_TO_SERVER,
    UPLOAD_FILE_TO_S3_START,
    UPLOAD_FILE_TO_S3_PROGRESS,
    UPLOAD_FILE_TO_S3_FINISHED,
    UPLOAD_FILE_TO_S3_RETRY,
    UPLOAD_FILE_COMPLETE,
    UPLOAD_FILE_CANCEL,
    UPLOAD_FILE_CANCEL_COMPLETE,
} from '../actions/uploads';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;

class UploadsState extends Record({
    errors: List(),
    isRegisteringWithServer: false,
    uploadsById: OrderedMap(),
}) {}


export class UploadModel extends Record({
    error: null,
    id: null,
    uuid: null,
    name: null,
    size: null,
    file: null,
    path: null,
    pathArray: List(),
    directoryPath: null,
    extension: null,
    nameUnsafe: null,
    s3UploadPolicy: null,
    s3UploadUrl: null,
    status: UPLOAD_STATUSES.PENDING,
    uploadPercent: 0,
    isUploading: false,
    isUploaded: false,
    isDeleting: false,
    isDeleted: false,
    xhrRequest: null,
    _dispatch: null,
}) {
    cancel() {
        return this._dispatch(uploadCancel(this, this._dispatch));
    }

    retry() {
        return this._dispatch(uploadFileToS3(this, this._dispatch));
    }
}

export default function uploadsReducer(state = new UploadsState(), action) {
    const payload = action.payload;

    switch (action.type) {
        // when client sends initial list of file descriptors to server
        case UPLOAD_BATCH_START: {
            const update = Map({
                errors: List(),
                isRegisteringWithServer: true,
            });
            return state.merge(update);
        }

        // server acknowledges receipt of file descriptors and returns upload tokens
        case UPLOAD_BATCH_SAVED_TO_SERVER: {
            if (action.error) {
                const update = Map({
                    errors: state.errors.push(payload.message),
                    isRegisteringWithServer: false,
                });
                return state.merge(update);
            }
            const update = Map({ isRegisteringWithServer: false });
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge(update, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_START: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_TO_S3_PROGRESS: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_TO_S3_FINISHED: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_COMPLETE: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_TO_S3_RETRY: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        // client requests to delete file by ID
        case UPLOAD_FILE_CANCEL: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        // server acknowledges file has been deleted
        case UPLOAD_FILE_CANCEL_COMPLETE: {
            const uploadsById = state.uploadsById.merge(payload.get('uploadsById'));
            return state.merge({ uploadsById });
        }

        default: {
            return state;
        }
    }
}
