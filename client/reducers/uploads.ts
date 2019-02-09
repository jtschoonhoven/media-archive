import { Dispatch } from 'redux';

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
import { Action } from '../types';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;

export class UploadModel {
        constructor(
        public readonly error: string = null,
        public readonly id: string = null,
        public readonly uuid: string = null,
        public readonly name: string = null,
        public readonly size: string = null,
        public readonly file: string = null,
        public readonly path: string = null,
        public readonly pathArray: string[] = [],
        public readonly directoryPath: string = null,
        public readonly extension: string = null,
        public readonly nameUnsafe: string = null,
        public readonly s3UploadPolicy: string = null,
        public readonly s3UploadUrl: string = null,
        public readonly status: string = UPLOAD_STATUSES.PENDING,
        public readonly uploadPercent: number = 0,
        public readonly isUploading: boolean = false,
        public readonly isUploaded: boolean = false,
        public readonly isDeleting: boolean = false,
        public readonly isDeleted: boolean = false,
        public readonly xhrRequest: string = null,
        public readonly _dispatch: Dispatch = null,
    ) {}
    cancel() {
        return this._dispatch(uploadCancel(this, this._dispatch));
    }

    retry() {
        return this._dispatch(uploadFileToS3(this, this._dispatch));
    }
}

export interface UploadsState {
    readonly errors: string[];
    readonly isRegisteringWithServer: boolean;
    readonly uploadsById: {
        [id: number]: UploadModel;
    };
}

const initialState: UploadsState = {
    errors: [],
    isRegisteringWithServer: false,
    uploadsById: {},
};


export default function uploadsReducer(state = initialState, action: Action): UploadsState {
    const payload = action.payload;

    switch (action.type) {
        // when client sends initial list of file descriptors to server
        case UPLOAD_BATCH_START: {
            const update = {
                errors: [], // clear any errors
                isRegisteringWithServer: true,
            };
            return Object.assign({}, state, update);
        }

        // server acknowledges receipt of file descriptors and returns upload tokens
        case UPLOAD_BATCH_SAVED_TO_SERVER: {
            if (action.error) {
                const update = {
                    errors: state.errors.push(payload.message),
                    isRegisteringWithServer: false,
                };
                return Object.assign({}, state, update);
            }
            const update = { isRegisteringWithServer: false };
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, update, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_START: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_PROGRESS: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_FINISHED: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_COMPLETE: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_RETRY: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        // client requests to delete file by ID
        case UPLOAD_FILE_CANCEL: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        // server acknowledges file has been deleted
        case UPLOAD_FILE_CANCEL_COMPLETE: {
            const uploadsById = Object.assign({}, state.uploadsById, payload.get('uploadsById'));
            return Object.assign({}, state, { uploadsById });
        }

        default: {
            return state;
        }
    }
}
