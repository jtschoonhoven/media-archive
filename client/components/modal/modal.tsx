import './modal.scss';

import * as React from 'react';
import * as History from 'history';

import ModalConfirm from './modal-confirm';
import ModalTextInput from './modal-text-input';
import ModalEditable from './modal-editable';
import ModalInfo from './modal-info';
import { MODAL_TYPES, ModalState, ModalConfig } from '../../reducers/modal';

interface Props {
    modalState: ModalState;
    location: History.Location;
    history: History.History;
}


export default class Modal extends React.Component<Props> {
    render() {
        const modalModel: ModalConfig = this.props.modalState.modal || {} as ModalConfig;

        if (modalModel.type === MODAL_TYPES.INFO) {
            return ModalInfo(modalModel);
        }
        if (modalModel.type === MODAL_TYPES.CONFIRM) {
            return ModalConfirm(modalModel);
        }
        if (modalModel.type === MODAL_TYPES.EDITABLE) {
            return (
                <ModalEditable
                    modalModel={ modalModel }
                    location={ this.props.location }
                    history={ this.props.history }
                />
            );
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
