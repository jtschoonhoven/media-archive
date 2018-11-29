import { createStore } from 'redux';
import reducer from './reducers';

let INITIAL_STATE;
if (typeof window !== 'undefined') {
    INITIAL_STATE = window.INITIAL_STATE;
}

const store = createStore(reducer, INITIAL_STATE);

export default store;
