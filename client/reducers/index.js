import { combineReducers } from 'redux';

import filesReducer from './files';
import detailReducer from './detail';
import searchReducer from './search';
import userReducer from './user';


const combinedReducers = combineReducers({
    detail: detailReducer,
    files: filesReducer,
    search: searchReducer,
    user: userReducer,
});


export default combinedReducers;
