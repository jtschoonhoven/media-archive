import React from 'react'; // eslint-disable-line no-unused-vars

import ModalWrapper from './modal-wrapper';
import { ModalInfoConfig } from '../../reducers/modal';

/*
 * Render some info in a modal.
 */
export default function ModalInfo(modalModel: ModalInfoConfig) {
    let bodyJSX;
    if (typeof modalModel.message === 'string') {
        bodyJSX = <p>{ modalModel.message }</p>;
    }
    else {
        bodyJSX = modalModel.message;
    }
    return ModalWrapper(modalModel.title, bodyJSX, modalModel.onClose);
}
