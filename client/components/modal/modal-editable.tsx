import * as History from 'history';
import * as React from 'react';
import { Formik, FormikValues } from 'formik';

import ModalWrapper from './modal-wrapper';
import { ModalEditableConfig } from '../../reducers/modal';

interface State {
    isSubmitting: boolean;
}

interface Props {
    modalModel: ModalEditableConfig;
    location: History.Location;
    history: History.History;
}


export default class ModalEditable extends React.Component<Props, State> {
    state: State = { isSubmitting: false };
    submitBtnRef: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.submitBtnRef = React.createRef();
        this.onModalConfirm = this.onModalConfirm.bind(this);
        this.onFormikSubmit = this.onFormikSubmit.bind(this);
    }

    render(): React.ReactElement<HTMLDivElement> {
        const modalConfig = this.props.modalModel;

        const bodyJSX = (
            <Formik
                initialValues={ modalConfig.initialValues }
                validate={ modalConfig.validator }
                onSubmit={ this.onFormikSubmit }
            >
                {({ isSubmitting, handleSubmit, handleReset }) => (
                    <form name="modal-editable-form" onSubmit={ handleSubmit } onReset={ handleReset }>
                        { modalConfig.getFormikJsx() }
                        <button
                            type="submit"
                            ref={ this.submitBtnRef }
                            disabled={ isSubmitting }
                            style={{ display: 'none' }}
                        />
                    </form>
                )}
            </Formik>
        );

        return ModalWrapper(
            modalConfig.title,
            bodyJSX,
            modalConfig.onClose,
            this.onModalConfirm,
            this.state.isSubmitting,
        );
    }

    /**
     * Handle when user clicks "confirm" button on the modal.
     */
    onModalConfirm(): boolean {
        this.setState({ isSubmitting: true }, () => {
            this.submitBtnRef.current.click(); // inform Formik the form has been submitted
        });
        // disable submit button temporarily to avoid double-submitting
        // FIXME: hook into the Formik lifecycle here and disable during isSubmitting state of form
        setTimeout(() => this.setState({ isSubmitting: false }), 2000);
        return false; // returning `false` from the onConfirm handler keeps the modal open
    }

    /**
     * Handler passed to Formik's onSubmit event.
     *
     * Wraps the passed-in onConfirm handler to accomodate Formik's needs.
     */
    onFormikSubmit(formikValues: FormikValues): void {
        const modalConfig = this.props.modalModel;
        try {
            modalConfig.onConfirm(formikValues);
        }
        catch (error) {
            // FIXME: show alert and handle errors here
            return;
        }
        modalConfig.onClose();
    }
}
