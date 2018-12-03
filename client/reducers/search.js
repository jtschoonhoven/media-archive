import { SEARCH, SEARCH_COMPLETE } from '../actions/search';


const INITIAL_STATE = {
    isFetching: false,
    results: [],
    error: null,
};


export default function searchReducer(state = INITIAL_STATE, action) {
    const data = action.payload || {};

    switch (action.type) {
        case SEARCH: {
            const update = { isFetching: true };
            return Object.assign({}, state, update);
        }

        case SEARCH_COMPLETE: {
            const update = {
                isFetching: false,
                error: action.error ? data.payload.message : null,
                results: data,
            };
            return Object.assign({}, state, update);
        }

        default: {
            return state;
        }
    }
}
