import { combineReducers } from 'redux';

import userReducer from './user';


const combinedReducers = combineReducers({
    user: userReducer,
});


export default combinedReducers;
