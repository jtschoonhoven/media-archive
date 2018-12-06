import queryString from 'query-string';

export const SEARCH = 'SEARCH';
export const SEARCH_COMPLETE = 'SEARCH_COMPLETE';


/*
 * Receive the JSON search results as JSON.
 * https://github.com/redux-utilities/flux-standard-action
 */
export function searchComplete(searchResults) {
    const isError = !!searchResults.error;
    const payload = isError ? new Error(searchResults.error.toString()) : searchResults;
    return {
        type: SEARCH_COMPLETE,
        payload,
        error: isError,
    };
}

/*
 * Query the database for media matching the given search string and filters.
 * Automatically send searchComplete action on success/failure.
 */
export function search(searchString, filters, dispatch) {
    const query = queryString.stringify({ s: searchString, ...filters });
    fetch(`/api/v1/search?${query}`)
        .then(response => response.json())
        .then(data => dispatch(searchComplete(data)))
        .catch(err => dispatch(searchComplete({ error: err.toString() })));
    return {
        type: SEARCH,
        payload: { searchString, filters },
    };
}
