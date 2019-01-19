import { Action, DetailsState } from '../types';
import { DETAILS_FETCH_COMPLETE, DETAILS_FETCH_START } from '../actions/detail';

export class DetailsModel {
    constructor(
        public readonly title: string = '',
        public readonly description: string = '',
        public readonly filename: string = '',
        public readonly path: string = '',
        public readonly type: string = '',
        public readonly url: string = '',
        public readonly tags: string = '',
        public readonly uploadStatus: string = '',
        public readonly extension: string = '',
    ) {}
}

const INITIAL_STATE: DetailsState = {
    isFetching: false,
    fileId: null,
    details: new DetailsModel(),
    errors: [],
};


export default function detailReducer(state = INITIAL_STATE, action: Action) {
    const payload = action.payload;

    switch (action.type) {
        case DETAILS_FETCH_START: {
            const update = {
                isFetching: true,
                errors: [] as ReadonlyArray<string>, // clear any errors from previous state
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
