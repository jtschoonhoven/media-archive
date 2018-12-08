import { FILES_LOAD, FILES_LOAD_COMPLETE } from '../actions/files';


const INITIAL_STATE = {
    isFetching: false,
    files: [],
    directories: [],
    error: null,
};


export default function filesReducer(state = INITIAL_STATE, action) {
    const data = action.payload || {};

    switch (action.type) {
        case FILES_LOAD: {
            const update = { isFetching: true, filesPath: data.path };
            return Object.assign({}, state, update);
        }

        case FILES_LOAD_COMPLETE: {
            const update = {
                isFetching: false,
                error: action.error ? data.toString() : null,
                files: data.files || [],
                directories: data.directories || [],
            };
            return Object.assign({}, state, update);
        }

        default: {
            return state;
        }
    }
}
