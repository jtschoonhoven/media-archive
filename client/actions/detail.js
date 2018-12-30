import { Map } from 'immutable';

import { DetailsModel } from '../reducers/detail';

export const DETAILS_FETCH_START = 'DETAILS_FETCH_START';
export const DETAILS_FETCH_COMPLETE = 'DETAILS_FETCH_COMPLETE';


/*
 * Retrieve file data from DB. Automatically send fetchComplete action on success/failure.
 */
export function getFileDetail(fileId, dispatch) {
    fetch(`/api/v1/detail/${fileId}`)
        .then(response => response.json())
        .then(data => dispatch(getFileDetailComplete(data)))
        .catch(err => dispatch(getFileDetailComplete({ error: err.message })));
    return {
        type: DETAILS_FETCH_START,
        payload: Map({ fileId }),
    };
}

/*
 * Receive the JSON file details as JSON.
 */
export function getFileDetailComplete(response) {
    if (response.error) {
        return {
            type: DETAILS_FETCH_COMPLETE,
            payload: new Error(response.error),
            error: true,
        };
    }
    return {
        type: DETAILS_FETCH_COMPLETE,
        payload: Map({ details: new DetailsModel(response.details) }),
    };
}
