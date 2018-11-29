import { createStore } from 'redux';
import reducer from './reducers';


const store = createStore(reducer, window.INITIAL_STATE);

export default store;
