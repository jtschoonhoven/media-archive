export interface UserState {
    email: string;
    isLoggedIn: boolean;
}

const INITIAL_STATE = {
    email: null,
    isLoggedIn: false,
};


export default function userReducer(state = INITIAL_STATE) {
    return state;
}
