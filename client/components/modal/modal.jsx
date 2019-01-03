import React from 'react'; // eslint-disable-line no-unused-vars

import ModalConfirm from './modal-confirm.jsx';
import ModalTextInput from './modal-text-input.jsx'; // eslint-disable-line no-unused-vars
import { MODAL_TYPES } from '../../reducers/modal';


export default class Modal extends React.Component {
    render() {
        const modalModel = this.props.modalState.modal || {};

        if (modalModel.type === MODAL_TYPES.CONFIRM) {
            return ModalConfirm(modalModel);
        }
        if (modalModel.type === MODAL_TYPES.TEXT) {
            return (
                <ModalTextInput
                    modalModel={ modalModel }
                    location={ this.props.location }
                    history={ this.props.history }
                />
            );
        }
        return '';
    }
}
