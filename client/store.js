import { createStore } from 'redux';
import reducer from './reducers';


const INITIAL_STATE = {
    search: {},
    user: {},
    upload: {},
};

const store = createStore(reducer, INITIAL_STATE);

export default store;
