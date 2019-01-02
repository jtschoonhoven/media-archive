import PropTypes from 'prop-types';
import React from 'react'; // eslint-disable-line no-unused-vars
import urlJoin from 'url-join';

import Alert from '../common/alert.jsx';
import Modal from '../common/modal.jsx';
import SETTINGS from '../../settings';

const FILENAME_BLACKLIST = new RegExp(SETTINGS.REGEX.FILENAME_BLACKLIST);
const DUPLICATE_BLACKLIST = new RegExp(SETTINGS.REGEX.DUPLICATE_BLACKLIST);
const TRIM_ENDS_BLACKLIST = new RegExp(SETTINGS.REGEX.TRIM_ENDS_BLACKLIST);

export default class ModalCreateDir extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dirname: '', error: null };
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInput(event) {
        event.preventDefault();

        let error = this.state.error;
        let dirname = event.target.value;

        if (dirname.match(FILENAME_BLACKLIST)) {
            error = new Error('Folder name may only contain letters, numbers, and dashes.');
        }

        dirname = dirname.replace(FILENAME_BLACKLIST, '-')
            .replace(DUPLICATE_BLACKLIST, '')
            .replace(TRIM_ENDS_BLACKLIST, '');

        this.setState({ dirname, error });
    }

    handleSubmit(event) {
        event.preventDefault();
        const currentUrl = this.props.location.pathname;
        const history = this.props.history;
        const newUrl = urlJoin(currentUrl, this.state.dirname);
        history.push(newUrl);
    }

    render() {
        const title = 'Create a New Folder';
        const bodyJsx = (
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Folder name"
                    value={ this.state.dirname }
                    onChange={ this.handleInput }
                />
                { this.state.error && Alert(this.state.error.message) }
            </div>
        );
        return new Modal(title, bodyJSX, onClose, onConfirm);
    }
}

CreateDirectoryModal.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};
