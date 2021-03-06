import React from 'react'; // eslint-disable-line no-unused-vars

import ModalWrapper from './modal-wrapper';
import { ModalConfirmConfig } from '../../reducers/modal';

/*
 * Render a confirmation dialog with the given title and message.
 */
export default function ModalConfirm(modalModel: ModalConfirmConfig) {
    let bodyJSX;
    if (typeof modalModel.message === 'string') {
        bodyJSX = <p>{ modalModel.message }</p>;
    }
    else {
        bodyJSX = modalModel.message;
    }
    return ModalWrapper(modalModel.title, bodyJSX, modalModel.onClose, modalModel.onConfirm);
}
