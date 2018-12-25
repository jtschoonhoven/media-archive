import {
    FILES_LOAD,
    FILES_LOAD_COMPLETE,
    FILES_UPLOAD,
    FILES_UPLOAD_ACKNOWLEDGED,
    FILES_UPLOAD_CANCEL,
    FILES_UPLOAD_CANCEL_COMPLETE,
    FILES_UPLOAD_TO_S3,
    FILES_UPLOAD_TO_S3_COMPLETE,
} from '../actions/files';


const INITIAL_STATE = {
    isFetching: false,
    results: [],
    uploads: [],
    deletions: [],
    path: undefined,
    error: null,
};


export default function filesReducer(state = INITIAL_STATE, action) {
    const data = action.payload || {};

    switch (action.type) {
        // when client has requested the list of files and directories at the given path
        case FILES_LOAD: {
            const update = { isFetching: true };
            return Object.assign({}, state, update);
        }

        // when client has received the list of files and directories
        case FILES_LOAD_COMPLETE: {
            const update = {
                isFetching: false,
                error: action.error ? data.message : null,
                results: data.results || state.results,
            };
            return Object.assign({}, state, update);
        }

        // when client sends initial list of file descriptors to server
        // add File objects to "uploads" array
        case FILES_UPLOAD: {
            const update = {
                isAcknowledging: true,
                uploads: state.uploads.concat(data.uploads || []),
            };
            return Object.assign({}, state, update);
        }

        // server acknowledges receipt of file descriptors and returns upload tokens
        case FILES_UPLOAD_ACKNOWLEDGED: {
            const update = {
                isAcknowledging: false,
                error: action.error ? data.message : null,
                results: data || state.results.slice(),
            };
            return Object.assign({}, state, update);
        }

        // client requests to delete file by ID
        case FILES_UPLOAD_CANCEL: {
            const fileId = data.id;
            const newResults = state.results.map((fileObj) => {
                const newFileObj = Object.assign({}, fileObj);
                // set "isDeleting" on the file being deleted
                if (newFileObj.id === fileId) {
                    newFileObj.isDeleting = true;
                }
                return newFileObj;
            });
            const update = { results: newResults };
            return Object.assign({}, state, update);
        }

        // server acknowledges file has been deleted
        case FILES_UPLOAD_CANCEL_COMPLETE: {
            const deletions = data.deletions;

            // copy the results with the deleted file removed (if no error)
            const newResults = [];
            state.results.forEach((oldFileObj) => {
                const newFileObj = Object.assign({}, oldFileObj);
                // if there was an error, unset "isDeleting" on the file object
                if (action.error) {
                    if (deletions.includes(newFileObj.id)) {
                        newFileObj.isDeleting = false;
                    }
                    newResults.push(newFileObj);
                }
                else if (!deletions.includes(newFileObj.id)) {
                    newResults.push(newFileObj);
                }
            });

            const update = {
                results: newResults,
                deletions: data.deletions || [],
                error: action.error ? data.message : null,
            };
            return Object.assign({}, state, update);
        }

        default: {
            return state;
        }
    }
}
