import { Record } from 'immutable';


class UserState extends Record({
    email: null,
    isLoggedIn: false,
}) {}

export default function userReducer(state = new UserState()) {
    return state;
}
