import React from 'react'; // eslint-disable-line no-unused-vars

import ModalWrapper from './wrapper.jsx';
import { MODAL_TYPES } from '../../reducers/modal';


export default class Modal extends React.Component {
    render() {
        const onClose = this.props.actions.hideModal;
        const modal = this.props.modalState.modal;

        if (modal) {
            if (modal.type === MODAL_TYPES.CONFIRM) {
                return ModalConfirm(modal.title, modal.message, onClose, modal.onConfirm);
            }
            if (modal.type === MODAL_TYPES.TEXT) {
                return ModalText(modal.title, modal.placeholder, onClose, modal.onConfirm);
            }
        }

        return '';
    }
}

/*
 * Render a confirmation dialog with the given title and message.
 */
function ModalConfirm(title, message, onClose, onConfirm = null) {
    const bodyJSX = <p>{ message }</p>;
    return ModalWrapper(title, bodyJSX, onClose, onConfirm);
}

function ModalText() {
    return <h1>TODO</h1>;
}
