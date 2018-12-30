import { List, Map, Record } from 'immutable';

import { SEARCH_START, SEARCH_COMPLETE, SEARCH_RESET } from '../actions/search';

export class FiltersModel extends Record({
    document: 0,
    image: 0,
    video: 0,
    audio: 0,
}) {}

export class ResultModel extends Record({
    id: null,
    name: null,
    description: null,
    thumbnailUrl: null,
    relevance: 0,
}) {}

const INITIAL_STATE = Record({
    isFetching: false,
    nextKey: null,
    prevKey: null,
    results: List(),
    errors: List(),
});


export default function searchReducer(state = INITIAL_STATE(), action) {
    const payload = action.payload;

    switch (action.type) {
        case SEARCH_START: {
            const update = Map({
                isFetching: true,
                results: List(), // clear any results from previous search
                errors: List(), // clear any errors from previous search
            });
            return state.merge(update, payload);
        }

        case SEARCH_COMPLETE: {
            if (action.error) {
                return state.merge({
                    isFetching: false,
                    errors: List([action.error]),
                });
            }
            const update = Map({ isFetching: false });
            return state.merge(update, payload);
        }

        case SEARCH_RESET: {
            return INITIAL_STATE();
        }

        default: {
            return state;
        }
    }
}
