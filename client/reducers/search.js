import { SEARCH, SEARCH_COMPLETE, SEARCH_RESET } from '../actions/search';


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
                error: action.error ? data.toString() : null,
                results: data.results || [],
                nextKey: data.nextKey,
                prevKey: data.prevKey,
            };
            return Object.assign({}, state, update);
        }

        case SEARCH_RESET: {
            const update = {
                results: [],
                isFetching: false,
                error: null,
                nextKey: null,
                prevKey: null,
            };
            return Object.assign({}, state, update);
        }

        default: {
            return state;
        }
    }
}
