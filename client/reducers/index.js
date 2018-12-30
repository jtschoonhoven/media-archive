import Joi from 'joi-browser';
import { isRecord, Map } from 'immutable';
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
function _validationPseudoReducer(state = null, action) {
    if (state && !isRecord(state)) {
        throw new Error('Invalid state: must be an instance of immutable.Record.');
    }
    const validation = Joi.validate(action, ACTION_SCHEMA);
    if (validation.error) {
        const err = validation.error.details[0].message;
        throw new Error(`Invalid action of type ${action.type}: ${err}.`);
    }
    return state;
}

export default combineReducers({
    _: _validationPseudoReducer,
    detail: detailReducer,
    files: filesReducer,
    search: searchReducer,
    user: userReducer,
    uploads: uploadsReducer,
});
