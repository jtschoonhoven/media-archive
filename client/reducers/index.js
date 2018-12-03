import { combineReducers } from 'redux';

import searchReducer from './search';
import userReducer from './user';


const combinedReducers = combineReducers({
    search: searchReducer,
    user: userReducer,
});


export default combinedReducers;
