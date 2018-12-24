import { GET_FILE_DETAIL, GET_FILE_DETAIL_COMPLETE } from '../actions/detail';


const INITIAL_STATE = {
    isFetching: false,
    fileId: undefined,
    details: undefined,
    error: null,
};


export default function searchReducer(state = INITIAL_STATE, action) {
    const data = action.payload || {};

    switch (action.type) {
        case GET_FILE_DETAIL: {
            const update = { isFetching: true, details: undefined, fileId: data.fileId };
            return Object.assign({}, state, update);
        }

        case GET_FILE_DETAIL_COMPLETE: {
            const update = {
                isFetching: false,
                error: action.error ? data.message : null,
                details: data.details || {},
            };
            return Object.assign({}, state, update);
        }

        default: {
            return state;
        }
    }
}
