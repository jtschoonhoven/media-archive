import React from 'react'; // eslint-disable-line no-unused-vars

import ModalWrapper from './modal-wrapper';

/*
 * Render a confirmation dialog with the given title and message.
 */
export default function ModalConfirm(modalModel) {
    const bodyJSX = <p>{ modalModel.message }</p>;
    return ModalWrapper(modalModel.title, bodyJSX, modalModel.onClose, modalModel.onConfirm);
}
