import { Action } from '../types';
import {
    DETAILS_FETCH_COMPLETE,
    DETAILS_FETCH_START,
    DETAILS_UPDATE_START,
    DETAILS_UPDATE_COMPLETE,
} from '../actions/detail';

export class DetailsModel {
    readonly title: string = '';
    readonly description: string = '';
    readonly filename: string = '';
    readonly path: string = '';
    readonly type: string = '';
    readonly url: string = '';
    readonly tags: string = '';
    readonly uploadStatus: string = '';
    readonly extension: string = '';
    readonly isConfidential?: boolean = null;
    readonly canLicense?: boolean = null;

    constructor(data: Partial<DetailsModel> = {}) {
        Object.assign(this, data);
    }

    /*
     * Return an object-literal representation of this UploadModel
     */
    toObject?(): DetailsModel {
        return {
            title: this.title,
            description: this.description,
            filename: this.filename,
            path: this.path,
            type: this.type,
            url: this.url,
            tags: this.tags,
            uploadStatus: this.uploadStatus,
            extension: this.extension,
            isConfidential: this.isConfidential,
            canLicense: this.canLicense,
        };
    }

    /**
     * Return a new DetailsModel with properties merged from passed in detailsInfo.
     */
    update?(detailsInfo: Partial<DetailsModel>): DetailsModel {
        const merged = Object.assign({}, this.toObject(), detailsInfo);
        return new DetailsModel(merged);
    }
}

export interface DetailsState {
    readonly fileId: number;
    readonly details: DetailsModel;
    readonly isFetching: boolean;
    readonly isUpdating: boolean;
    readonly errors: ReadonlyArray<string>;
}

const INITIAL_STATE: DetailsState = {
    fileId: null,
    details: new DetailsModel(),
    isFetching: false,
    isUpdating: false,
    errors: [],
};


export default function detailReducer(
    state: DetailsState = INITIAL_STATE,
    action: Action,
): DetailsState {
    const payload = action.payload;

    switch (action.type) {
        case DETAILS_FETCH_START: {
            const update = {
                isFetching: true,
                errors: [], // clear any errors from previous state
                details: new DetailsModel(), // clear details from previous state
            };
            return { ...state, ...update, ...payload };
        }

        case DETAILS_FETCH_COMPLETE: {
            if (action.error) {
                const update = { isFetching: false, errors: [payload.message] };
                return { ...state, ...update };
            }
            const update = { isFetching: false };
            return { ...state, ...update, ...payload };
        }

        case DETAILS_UPDATE_START: {
            const update = {
                isUpdating: true,
                errors: [], // clear any errors from previous state
            };
            return { ...state, ...update, ...payload };
        }

        case DETAILS_UPDATE_COMPLETE: {
            if (action.error) {
                const update = {
                    errors: [payload.message],
                    isUpdating: false,
                };
                return { ...state, ...update };
            }
            const update = {
                errors: [],
                isUpdating: false,
            };
            return { ...state, ...update, ...payload };
        }

        default: {
            return state;
        }
    }
}
