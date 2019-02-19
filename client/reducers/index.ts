import { combineReducers } from 'redux';

import detailReducer from './detail';
import filesReducer from './files';
import modalReducer from './modal';
import searchReducer from './search';
import uploadsReducer from './uploads';
import userReducer from './user';


export default combineReducers({
    detail: detailReducer,
    files: filesReducer,
    modal: modalReducer,
    search: searchReducer,
    uploads: uploadsReducer,
    user: userReducer,
});
