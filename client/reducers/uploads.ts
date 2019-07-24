import { Dispatch } from 'redux';

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
    UPLOAD_RESET,
    UploadsMap,
} from '../actions/uploads';
import { Action, Dict } from '../types';

export interface UploadsState {
    readonly errors: string[];
    readonly isRegisteringWithServer: boolean;
    readonly uploadsById: UploadsMap;
}

export class UploadModel {
    readonly error: string;
    readonly id: number;
    readonly uuid: string;
    readonly name: string;
    readonly size: number;
    readonly path: string;
    readonly pathArray: ReadonlyArray<string>;
    readonly directoryPath: string;
    readonly extension: string;
    readonly nameUnsafe: string;
    readonly s3UploadUrl: string;
    readonly status: string;
    readonly file?: File;
    readonly _dispatch?: Dispatch;
    readonly _xhrRequest?: XMLHttpRequest;
    readonly uploadPercent?: number = 0;
    readonly isUploading?: boolean = false;
    readonly isUploaded?: boolean = false;
    readonly isDeleting?: boolean = false;
    readonly isDeleted?: boolean = false;
    readonly s3UploadPolicy: {
        'key': string;
        'Content-Type': string;
        'Content-Disposition': string;
        'success_action_status': string;
        'bucket': string;
        'X-Amz-Algorithm': string;
        'X-Amz-Credential': string;
        'X-Amz-Date': string;
        'Policy': string;
        'X-Amz-Signature': string;
    };

    constructor(uploadInfo: UploadModel) {
        Object.assign(this, uploadInfo);
    }

    /*
     * Dispatch an UPLOAD_CANCEL action.
     */
    cancel?(): Action {
        return this._dispatch(uploadCancel(this, this._dispatch));
    }

    /*
     * Dispatch an UPLOAD_RETRY action.
     */
    retry?(): Action {
        return this._dispatch(uploadFileToS3(this, this._dispatch));
    }

    /*
     * Return an object-literal representation of this UploadModel
     */
    toObject?(): UploadModel {
        return {
            error: this.error,
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            size: this.size,
            path: this.path,
            pathArray: this.pathArray,
            directoryPath: this.directoryPath,
            extension: this.extension,
            nameUnsafe: this.nameUnsafe,
            s3UploadPolicy: this.s3UploadPolicy,
            s3UploadUrl: this.s3UploadUrl,
            status: this.status,
            file: this.file,
            _dispatch: this._dispatch,
            _xhrRequest: this._xhrRequest,
            uploadPercent: this.uploadPercent,
            isUploading: this.isUploading,
            isUploaded: this.isUploaded,
            isDeleting: this.isDeleting,
            isDeleted: this.isDeleted,
        };
    }

    /**
     * Return a new UploadModel with properties merged from passed in uploadInfo.
     */
    update?(uploadInfo: Partial<UploadModel>): UploadModel {
        const merged = Object.assign({}, this.toObject(), uploadInfo);
        return new UploadModel(merged);
    }
}

const initialState: UploadsState = {
    errors: [],
    isRegisteringWithServer: false,
    uploadsById: new Map(),
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
                const errors = [...state.errors, payload.message];
                const update = { errors, isRegisteringWithServer: false };
                return Object.assign({}, state, update);
            }
            const update = { isRegisteringWithServer: false };
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, update, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_START: {
            if (action.error) {
                const errors = state.errors.concat(payload.message);
                return Object.assign({}, state, errors);
            }
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_PROGRESS: {
            if (action.error) {
                const errors = state.errors.concat(payload.message);
                return Object.assign({}, state, errors);
            }
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_FINISHED: {
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_COMPLETE: {
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        case UPLOAD_FILE_TO_S3_RETRY: {
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        // client requests to delete file by ID
        case UPLOAD_FILE_CANCEL: {
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        // server acknowledges file has been deleted
        case UPLOAD_FILE_CANCEL_COMPLETE: {
            const uploadsById = new Map([...state.uploadsById, ...(payload as Dict).uploadsById]);
            return Object.assign({}, state, { uploadsById });
        }

        // all uploads are complete: reset uploads state
        case UPLOAD_RESET: {
            const uploadsById = new Map(); // clear uploadsById
            return Object.assign({}, state, { uploadsById });
        }

        default: {
            return state;
        }
    }
}
