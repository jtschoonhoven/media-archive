import { Record } from 'immutable';

import { MODAL_SHOW_CONFIRM, MODAL_SHOW_TEXT, MODAL_HIDE } from '../actions/modal';

export const MODAL_TYPES = {
    CONFIRM: 'confirm',
    TEXT: 'text',
};

export class ModalConfirmModel extends Record({
    type: MODAL_TYPES.CONFIRM,
    title: null,
    message: null,
    onClose: null,
    onConfirm: null,
}) {}

export class ModalTextModel extends Record({
    type: MODAL_TYPES.TEXT,
    title: null,
    message: null,
    placeholder: null,
    onClose: null,
    onConfirm: null,
    validator: null,
}) {}

class ModalState extends Record({
    modal: null,
}) {}


export default function modalReducer(state = new ModalState(), action) {
    const payload = action.payload;

    switch (action.type) {
        case MODAL_SHOW_CONFIRM: {
            return state.merge(payload);
        }

        case MODAL_SHOW_TEXT: {
            return state.merge(payload);
        }

        case MODAL_HIDE: {
            return state.merge({ modal: null });
        }

        default: {
            return state;
        }
    }
}
