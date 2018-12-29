import Joi from 'joi-browser';
import { Map } from 'immutable';
import { combineReducers } from 'redux';

import filesReducer from './files';
import detailReducer from './detail';
import searchReducer from './search';
import userReducer from './user';
import uploadsReducer from './uploads';

const ACTION_SCHEMA = Joi.object({
    type: Joi.string().required(),
    payload: [
        Joi.object().type(Map).required(),
        Joi.object().type(Error).required(),
    ],
    error: Joi.boolean(),
    meta: Joi.any(),
});

/*
 * Enforce that actions are "standard flux actions".
 * Refer to https://github.com/redux-utilities/flux-standard-action
 */
export function validateAction(state, action) {
    const validation = Joi.validate(action, ACTION_SCHEMA);
    if (validation.error) {
        const err = validation.error.details[0].message;
        throw new Error(`Invalid action of type ${action.type}: ${err}`);
    }
}

export default combineReducers({
    detail: detailReducer,
    files: filesReducer,
    search: searchReducer,
    user: userReducer,
    uploads: uploadsReducer,
});
