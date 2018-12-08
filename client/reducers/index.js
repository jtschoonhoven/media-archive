import { combineReducers } from 'redux';

import filesReducer from './files';
import searchReducer from './search';
import userReducer from './user';


const combinedReducers = combineReducers({
    files: filesReducer,
    search: searchReducer,
    user: userReducer,
});


export default combinedReducers;
