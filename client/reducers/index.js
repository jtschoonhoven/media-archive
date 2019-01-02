import Joi from 'joi-browser';
import { Map } from 'immutable';
import { combineReducers } from 'redux';

import detailReducer from './detail';
import filesReducer from './files';
import modalReducer from './modal';
import searchReducer from './search';
import uploadsReducer from './uploads';
import userReducer from './user';

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
    if (state && !state.isRecord()) {
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
    modal: modalReducer,
    search: searchReducer,
    uploads: uploadsReducer,
    user: userReducer,
});
