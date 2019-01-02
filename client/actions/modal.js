import { Map } from 'immutable';

import { ModalConfirmModel, ModalTextModel } from '../reducers/modal';

export const MODAL_SHOW_CONFIRM = 'MODAL_SHOW_CONFIRM';
export const MODAL_SHOW_TEXT = 'MODAL_SHOW_TEXT';
export const MODAL_HIDE = 'MODAL_HIDE';


/*
 * Display a confirmation modal with an "OK" button.
 */
export function showConfirmModal(title, message, onConfirm) {
    const modal = new ModalConfirmModel({ title, message, onConfirm });
    return {
        type: MODAL_SHOW_CONFIRM,
        payload: Map({ modal }),
    };
}

/*
 * Display a modal with one text input.
 */
export function showTextModal(title, message, placeholder, onConfirm) {
    const modal = new ModalTextModel({ title, message, placeholder, onConfirm });
    return {
        type: MODAL_SHOW_TEXT,
        payload: Map({ modal }),
    };
}

/*
 * Hide the current modal if exists.
 */
export function hideModal() {
    return {
        type: MODAL_HIDE,
        payload: Map(),
    };
}
