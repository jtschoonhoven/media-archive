export const FILES_LOAD = 'FILES_LOAD';
export const FILES_LOAD_COMPLETE = 'FILES_LOAD_COMPLETE';

/*
 * Actions must be "standard flux actions".
 * Refer to https://github.com/redux-utilities/flux-standard-action
 */

/*
 * Receive the files API results as JSON.
 */
export function loadComplete(filesResults) {
    const isError = !!filesResults.error;
    const payload = isError ? new Error(filesResults.error.toString()) : filesResults;
    return {
        type: FILES_LOAD_COMPLETE,
        payload,
        error: isError,
    };
}

/*
 * Load all the directories and files at a given path.
 */
export function load(path, dispatch) {
    path = path.startsWith('/') ? path.slice(1) : path; // remove leading slash
    fetch(`/api/v1/files/${path}`)
        .then(response => response.json())
        .then(data => dispatch(loadComplete(data)))
        .catch(err => dispatch(loadComplete({ error: err.toString() })));
    return {
        type: FILES_LOAD,
        payload: { path },
    };
}
