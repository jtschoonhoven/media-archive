import queryString from 'query-string';
import { Dispatch } from 'redux';

import { Action } from '../types';
import { SearchResult, FiltersModel } from '../reducers/search';

export const SEARCH_START = 'SEARCH_START';
export const SEARCH_COMPLETE = 'SEARCH_COMPLETE';
export const SEARCH_RESET = 'SEARCH_RESET';

interface SearchResponse {
    readonly error?: string;
    readonly nextKey?: string;
    readonly prevKey?: string;
    readonly results?: ReadonlyArray<SearchResult>;
}

/*
 * Query the database for media matching the given search string and filters.
 * Automatically send searchComplete action on success/failure.
 */
export function search(searchTerm: string, filtersModel: FiltersModel, dispatch): Action {
    const filtersObj = filtersModel.toFilteredObject();
    const query = queryString.stringify({ s: searchTerm, ...filtersObj });

    fetch(`/api/v1/search?${query}`)
        .then(response => response.json())
        .then(data => dispatch(searchComplete(data, filtersModel)))
        .catch(err => dispatch(searchComplete({ error: err.message })));

    return {
        type: SEARCH_START,
        payload: { searchTerm, filters: filtersModel },
    };
}

/*
 * Receive the JSON search results as JSON.
 */
export function searchComplete(
    response: SearchResponse,
    filtersModel: FiltersModel = null,
): Action {
    if (response.error) {
        return {
            type: SEARCH_COMPLETE,
            payload: new Error(response.error),
            error: true,
        };
    }

    return {
        type: SEARCH_COMPLETE,
        payload: {
            results: response.results,
            filters: filtersModel.update({
                nextKey: response.nextKey,
                prevKey: response.prevKey,
            }),
        },
    };
}

/*
 * Reset search to initial state.
 */
export function searchReset(): Action {
    return {
        type: SEARCH_RESET,
        payload: {},
    };
}
