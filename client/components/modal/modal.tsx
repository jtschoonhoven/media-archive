import * as React from 'react';
import * as History from 'history';

import ModalConfirm from './modal-confirm';
import ModalTextInput from './modal-text-input';
import { MODAL_TYPES, ModalState, ModalConfig, ModalTextConfig } from '../../reducers/modal';

interface Props {
    modalState: ModalState;
    location: History.Location;
    history: History.History;
}


export default class Modal extends React.Component<Props> {
    render() {
        const modalModel: ModalConfig = this.props.modalState.modal || {} as ModalConfig;

        if (modalModel.type === MODAL_TYPES.CONFIRM) {
            return ModalConfirm(modalModel);
        }
        if (modalModel.type === MODAL_TYPES.TEXT) {
            return (
                <ModalTextInput
                    modalModel={ (modalModel as ModalTextConfig) }
                    location={ this.props.location }
                    history={ this.props.history }
                />
            );
        }
        return '';
    }
}
