import { Action } from '../types';
import { DETAILS_FETCH_COMPLETE, DETAILS_FETCH_START } from '../actions/detail';

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

    constructor(data: Partial<DetailsModel> = {}) {
        Object.assign(this, data);
    }
}

export interface DetailsState {
    readonly isFetching: boolean;
    readonly fileId: number;
    readonly errors: ReadonlyArray<string>;
    readonly details: DetailsModel;
}

const INITIAL_STATE: DetailsState = {
    isFetching: false,
    fileId: null,
    details: new DetailsModel(),
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

        default: {
            return state;
        }
    }
}
