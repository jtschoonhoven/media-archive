import { Dispatch } from 'redux';

import { DetailsModel } from '../reducers/detail';
import { Action } from '../types';

export const DETAILS_FETCH_START = 'DETAILS_FETCH_START';
export const DETAILS_FETCH_COMPLETE = 'DETAILS_FETCH_COMPLETE';


/*
 * Retrieve file data from DB. Automatically send fetchComplete action on success/failure.
 */
export function getFileDetail(fileId: number, dispatch: Dispatch): Action {
    fetch(`/api/v1/detail/${fileId}`)
        .then(response => response.json())
        .then(data => dispatch(getFileDetailComplete(data)))
        .catch(err => dispatch(getFileDetailComplete({ error: err.message })));
    return {
        type: DETAILS_FETCH_START,
        payload: { fileId },
    };
}

/*
 * Receive the JSON file details as JSON.
 */
export function getFileDetailComplete(response): Action {
    if (response.error) {
        return {
            type: DETAILS_FETCH_COMPLETE,
            payload: new Error(response.error),
            error: true,
        };
    }
    return {
        type: DETAILS_FETCH_COMPLETE,
        payload: { details: new DetailsModel(response.details) },
    };
}
