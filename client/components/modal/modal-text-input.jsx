import PropTypes from 'prop-types';
import React from 'react'; // eslint-disable-line no-unused-vars

import Alert from '../common/alert.jsx';
import ModalWrapper from './modal-wrapper.jsx';


/*
 * Render a text input dialog. Callback receive the value of the input.
 */
export default class ModalTextInput extends React.Component { // eslint-disable-line no-unused-vars
    constructor(props) {
        super(props);
        this.state = { value: '', error: null };
        this.inputRef = React.createRef();
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

ModalTextInput.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    modalModel: PropTypes.object.isRequired,
};
