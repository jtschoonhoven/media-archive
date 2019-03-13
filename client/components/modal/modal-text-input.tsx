import * as React from 'react';
import * as History from 'history';

import Alert from '../common/alert';
import ModalWrapper from './modal-wrapper.jsx';
import { ModalTextConfig } from '../../reducers/modal';

interface Props {
    modalModel: ModalTextConfig;
    location: History.Location;
    history: History.History;
}

/*
 * Render a text input dialog. Callback receive the value of the input.
 */
export default class ModalTextInput extends React.Component<Props> {
    state = { value: '', error: null };
    inputRef: React.RefObject<HTMLInputElement> = React.createRef();

    constructor(props) {
        super(props);
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        this.inputRef.current.focus();
    }

    render() {
        const modalModel = this.props.modalModel;
        const error = this.state.error;

        const bodyJSX = (
            <div>
                <label htmlFor="archive-modal-text-input">{ modalModel.message }</label>
                <div className="input-group">
                    <input
                        id="archive-modal-text-input"
                        type="text"
                        className="form-control"
                        placeholder={ modalModel.placeholder }
                        value={ this.state.value }
                        onChange={ this.handleInput }
                        onKeyPress={ this.handleKeyPress }
                        ref={ this.inputRef }
                    />
                    { error && Alert(error) }
                </div>
            </div>
        );

        return ModalWrapper(
            modalModel.title,
            bodyJSX,
            modalModel.onClose,
            this.handleSubmit,
            error,
        );
    }

    /*
     * Receive and (optionally) validate text input on keystroke.
     */
    handleInput(event) {
        event.preventDefault();
        const modalModel = this.props.modalModel;
        const value = event.target.value;
        let error = this.state.error;

        if (modalModel.validator) {
            try {
                error = modalModel.validator(value);
            }
            catch (err) {
                error = err.message;
            }
        }
        this.setState({ value, error });
    }

    /*
     * Call callback with value of input on submit, then cleanup modal.
     */
    handleSubmit() {
        const value = this.state.value;
        const error = this.state.error;
        const modalModel = this.props.modalModel;

        if (error) {
            this.setState({ error: 'Cannot submit while input is invalid.' });
        }
        else {
            modalModel.onConfirm(value);
            modalModel.onClose();
        }
    }

    /*
     * Detect if user submits form with ENTER key or closes with ESCAPE.
     */
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.handleSubmit();
        }
        if (event.key === 'Escape') {
            this.props.modalModel.onClose();
        }
    }
}
