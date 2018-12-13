import {
    FILES_LOAD,
    FILES_LOAD_COMPLETE,
    FILES_UPLOAD,
    FILES_UPLOAD_ACKNOWLEDGED,
} from '../actions/files';


const INITIAL_STATE = {
    isFetching: false,
    results: [],
    path: undefined,
    error: null,
};


export default function filesReducer(state = INITIAL_STATE, action) {
    const data = action.payload || {};

    switch (action.type) {
        // when client has requested the list of files and directories at the given path
        case FILES_LOAD: {
            const update = { isFetching: true, filesPath: data.path };
            return Object.assign({}, state, update);
        }

        // when client has received the list of files and directories
        case FILES_LOAD_COMPLETE: {
            const update = {
                isFetching: false,
                error: action.error ? data.toString() : null,
                results: data.results || [],
            };
            return Object.assign({}, state, update);
        }

        // when client sends initial list of file descriptors to server
        case FILES_UPLOAD: {
            const update = { isAcknowledging: true, uploadsPath: data.path };
            return Object.assign({}, state, update);
        }

        // server acknowledges receipt of file descriptors and returns upload tokens
        case FILES_UPLOAD_ACKNOWLEDGED: {
            const update = {
                isFetching: false,
                error: action.error ? data.toString() : null,
                uploads: data.results || [],
            };
            return Object.assign({}, state, update);
        }

        default: {
            return state;
        }
    }
}
