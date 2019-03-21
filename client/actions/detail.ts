import { Dispatch } from 'redux';

import { DetailsModel } from '../reducers/detail';
import { Action } from '../types';

export const DETAILS_FETCH_START = 'DETAILS_FETCH_START';
export const DETAILS_FETCH_COMPLETE = 'DETAILS_FETCH_COMPLETE';


interface DetailsResponse {
    readonly error?: string;
    readonly details?: {
        readonly description: string;
        readonly extension: string;
        readonly filename: string;
        readonly id: number;
        readonly path: string;
        readonly tags: string;
        readonly thumbnailUrl: string;
        readonly title: string;
        readonly type: string;
        readonly uploadStatus: string;
        readonly url: string;
        readonly uuid?: string;
    };
}

/*
 * Retrieve file data from DB. Automatically send fetchComplete action on success/failure.
 */
export function getFileDetail(fileId: number, dispatch: Dispatch): Action {
    fetch(`/api/v1/detail/${fileId}`)
        .then(response => response.json())
        .then((res: DetailsResponse) => dispatch(getFileDetailComplete(res)))
        .catch((err: Error) => dispatch(getFileDetailComplete({ error: err.message })));
    return {
        type: DETAILS_FETCH_START,
        payload: { fileId },
    };
}

/*
 * Receive the JSON file details as JSON.
 */
export function getFileDetailComplete(response: DetailsResponse): Action {
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
