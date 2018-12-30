import queryString from 'query-string';
import { List, Map } from 'immutable';

import { FiltersModel, ResultModel } from '../reducers/search';

export const SEARCH_START = 'SEARCH';
export const SEARCH_COMPLETE = 'SEARCH_COMPLETE';
export const SEARCH_RESET = 'SEARCH_RESET';


/*
 * Query the database for media matching the given search string and filters.
 * Automatically send searchComplete action on success/failure.
 */
export function search(searchString, filters, dispatch) {
    const filtersModel = new FiltersModel(filters);
    const filtersMap = Map(filtersModel).filter(filter => !!filter).toObject();
    const query = queryString.stringify({ s: searchString, ...filtersMap });

    fetch(`/api/v1/search?${query}`)
        .then(response => response.json())
        .then(data => dispatch(searchComplete(data)))
        .catch(err => dispatch(searchComplete({ error: err.message })));

    return {
        type: SEARCH_START,
        payload: Map(),
    };
}

/*
 * Receive the JSON search results as JSON.
 */
export function searchComplete(response) {
    if (response.error) {
        return {
            type: SEARCH_COMPLETE,
            payload: new Error(response.error),
            error: true,
        };
    }

    const resultModels = List(response.results.map((resultData) => {
        return new ResultModel(resultData);
    }));

    return {
        type: SEARCH_COMPLETE,
        payload: Map({
            results: resultModels,
            nextKey: response.nextKey,
            prevKey: response.prevKey,
        }),
    };
}

/*
 * Reset search to initial state.
 */
export function searchReset() {
    return {
        type: SEARCH_RESET,
        payload: Map(),
    };
}
