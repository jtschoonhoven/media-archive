import { List, Map, OrderedMap, Record } from 'immutable';

import SETTINGS from '../settings';
import {
    UPLOAD_BATCH_START,
    UPLOAD_BATCH_SAVED_TO_SERVER,
    UPLOAD_FILE_TO_S3_START,
    UPLOAD_FILE_TO_S3_PROGRESS,
    UPLOAD_FILE_TO_S3_FINISHED,
    UPLOAD_FILE_COMPLETE,
    UPLOAD_FILE_CANCEL,
    UPLOAD_FILE_CANCEL_COMPLETE,
} from '../actions/uploads';
import { validateAction } from './index';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;

const uploadsState = Record({
    errors: List(),
    uploadsById: OrderedMap(),
});


export class UploadModel extends Record({
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
    status: UPLOAD_STATUSES.PENDING,
    uploadPercent: 0,
    isUploading: false,
    isUploaded: false,
    isDeleting: false,
    isDeleted: false,
}) {}

export default function uploadsReducer(state = uploadsState(), action) {
    validateAction(state, action);
    const payload = action.payload;

    switch (action.type) {
        // when client sends initial list of file descriptors to server
        case UPLOAD_BATCH_START: {
            const update = Map({
                isAcknowledging: true,
                errors: List(),
            });
            return state.merge(update);
        }

        // server acknowledges receipt of file descriptors and returns upload tokens
        case UPLOAD_BATCH_SAVED_TO_SERVER: {
            if (action.error) {
                const update = Map({
                    isAcknowledging: false,
                    errors: state.errors.push(payload.message),
                });
                return state.merge(update);
            }
            const update = Map({ isAcknowledging: false });
            return state.merge(update, payload);
        }

        case UPLOAD_FILE_TO_S3_START: {
            const uploadsById = state.uploadsById.merge(payload.uploadsById);
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_TO_S3_PROGRESS: {
            const uploadsById = state.uploadsById.merge(payload.uploadsById);
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_TO_S3_FINISHED: {
            const uploadsById = state.uploadsById.merge(payload.uploadsById);
            return state.merge({ uploadsById });
        }

        case UPLOAD_FILE_COMPLETE: {
            const uploadsById = state.uploadsById.merge(payload.uploadsById);
            return state.merge({ uploadsById });
        }

        // client requests to delete file by ID
        case UPLOAD_FILE_CANCEL: {
            const uploadsById = state.uploadsById.merge(payload.uploadsById);
            return state.merge({ uploadsById });
        }

        // server acknowledges file has been deleted
        case UPLOAD_FILE_CANCEL_COMPLETE: {
            const uploadsById = state.uploadsById.merge(payload.uploadsById);
            return state.merge({ uploadsById });
        }

        default: {
            return state;
        }
    }
}
