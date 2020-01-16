import urlJoin from 'url-join';
import { Dispatch } from 'redux';

import { DetailsModel } from '../reducers/detail';
import { Action } from '../types';

export const DETAILS_FETCH_START = 'DETAILS_FETCH_START';
export const DETAILS_FETCH_COMPLETE = 'DETAILS_FETCH_COMPLETE';
export const DETAILS_UPDATE_START = 'DETAILS_UPDATE_START';
export const DETAILS_UPDATE_COMPLETE = 'DETAILS_UPDATE_COMPLETE';

const POST_HEADERS = { 'Content-Type': 'application/json' };

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

interface DetailsUpdateResponse {
    readonly error?: string;
    readonly details?: DetailsModel;
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

/**
 * Update file detail metadata in the DB.
 */
export function updateFileDetail(
    fileId: number,
    detailsModel: DetailsModel,
    dispatch: Dispatch,
): Action {
    const fileMetadata = {
        title: detailsModel.title,
        description: detailsModel.description,
        transcript: detailsModel.transcript,
        tags: detailsModel.tags,
        isConfidential: detailsModel.isConfidential,
        canLicense: detailsModel.canLicense,
    };

    const body = JSON.stringify(fileMetadata);
    const path = urlJoin('/api/v1/detail/', fileId.toString());

    fetch(path, { body, method: 'POST', headers: POST_HEADERS })
        .then(response => response.json())
        .then((data) => {
            dispatch(_updateFileDetailComplete(data, detailsModel, fileId, dispatch));
        })
        .catch((err) => {
            const error = err.message;
            dispatch(_updateFileDetailComplete({ error }, detailsModel, fileId, dispatch));
        });

    return {
        type: DETAILS_UPDATE_START,
        payload: {},
    };
}

/**
 * Receive the JSON of the updated details model.
 */
function _updateFileDetailComplete(
    response: DetailsUpdateResponse,
    detailsModel: DetailsModel,
    fileId: number,
    dispatch: Dispatch,
): Action {
    if (response.error) {
        return {
            type: DETAILS_UPDATE_COMPLETE,
            payload: new Error(response.error),
            error: true,
        };
    }

    // fetch updated details from server
    getFileDetail(fileId, dispatch);

    return {
        type: DETAILS_UPDATE_COMPLETE,
        payload: {
            details: new DetailsModel(), // clear the old detailsModel as we're re-fetching
        },
    };
}
