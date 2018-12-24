export const GET_FILE_DETAIL = 'GET_FILE_DETAILS';
export const GET_FILE_DETAIL_COMPLETE = 'GET_FILE_DETAILS_COMPLETE';

/*
 * Actions must be "standard flux actions".
 * Refer to https://github.com/redux-utilities/flux-standard-action
 */

/*
 * Receive the JSON file details as JSON.
 */
export function getFileDetailComplete(fileDetails) {
    const isError = !!fileDetails.error;
    const payload = isError ? new Error(fileDetails.error.message) : fileDetails;
    return {
        type: GET_FILE_DETAIL_COMPLETE,
        payload,
        error: isError,
    };
}

/*
 * Retrieve file data from DB. Automatically send fetchComplete action on success/failure.
 */
export function getFileDetail(fileId, dispatch) {
    fetch(`/api/v1/detail/${fileId}`)
        .then(response => response.json())
        .then(data => dispatch(getFileDetailComplete(data)))
        .catch(err => dispatch(getFileDetailComplete({ error: err.message })));
    return {
        type: GET_FILE_DETAIL,
        payload: { id: fileId },
    };
}
