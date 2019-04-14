import * as History from 'history';
import * as React from 'react';
import { Formik } from 'formik';

import ModalWrapper from './modal-wrapper';
import { ModalEditableConfig } from '../../reducers/modal';

interface Props {
    modalModel: ModalEditableConfig;
    location: History.Location;
    history: History.History;
}


export default class ModalEditable extends React.Component<Props> {
    render(): React.ReactElement<HTMLDivElement> {
        const modalModel = this.props.modalModel;

        const bodyJSX = (
            <Formik
                initialValues={ modalModel.initialValues }
                validate={ modalModel.validator }
                onSubmit={ modalModel.onConfirm }
            >
                { modalModel.getFormikJsx }
            </Formik>
        );

        return ModalWrapper(
            modalModel.title,
            bodyJSX,
            modalModel.onClose,
        );
    }
}
