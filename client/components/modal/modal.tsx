import * as React from 'react';
import * as History from 'history';

import ModalConfirm from './modal-confirm.jsx';
import ModalTextInput from './modal-text-input.jsx';
import { MODAL_TYPES, ModalState, ModalModel, ModalTextModel } from '../../reducers/modal';

interface Props {
    modalState: ModalState;
    location: History.Location;
    history: History.History;
}


export default class Modal extends React.Component<Props> {
    render() {
        const modalModel: ModalModel = this.props.modalState.modal || {} as ModalModel;

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
