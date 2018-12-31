import { List, Map, Record } from 'immutable';

import { DETAILS_FETCH_START, DETAILS_FETCH_COMPLETE } from '../actions/detail';

export class DetailsModel extends Record({
    title: null,
    description: null,
    filename: null,
    path: null,
    type: null,
    url: null,
    tags: null,
    uploadStatus: null,
    extension: null,
}) {}

const INITIAL_STATE = Record({
    isFetching: false,
    fileId: null,
    details: new DetailsModel(),
    errors: List(),
});


export default function detailReducer(state = INITIAL_STATE(), action) {
    const payload = action.payload;

    switch (action.type) {
        case DETAILS_FETCH_START: {
            const update = Map({
                isFetching: true,
                errors: List(), // clear any errors from previous state
                details: Map({}), // clear details from previous state
            });
            return state.merge(update, payload);
        }

        case DETAILS_FETCH_COMPLETE: {
            if (action.error) {
                return state.merge({
                    isFetching: false,
                    errors: List([payload.message]),
                });
            }
            const update = Map({ isFetching: false });
            return state.merge(update, payload);
        }

        default: {
            return state;
        }
    }
}
