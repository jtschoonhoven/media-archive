const INITIAL_STATE = {
    isLoggedIn: false,
};

const ACTIONS = {
    'FETCH_START': 'USER_FETCH_START',
    'FETCH_END': 'USER_FETCH_END',
};

// see https://github.com/redux-utilities/flux-standard-action
function fetchUserStart() {
    return { type: ACTIONS.FETCH_START };
}

function fetchUserEnd(userObj, err) {
    return {
        type: ACTIONS.FETCH_END,
        payload: err || userObj,
        error: Boolean(err),
    };
}

function userReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTIONS.USER_FETCH_START: {
            const update = { isInFlight: true };
            return Object.assign({}, state, update);
        }
        default: {
            return state;
        }
    }
}


export default userReducer;
export { fetchUserStart, fetchUserEnd };
