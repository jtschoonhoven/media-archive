import './style.scss';

import PropTypes from 'prop-types';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux'; // eslint-disable-line no-unused-vars
import { Route, Switch } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import reducer from '../reducers';
import RestrictedRoute from './common/restricted.jsx'; // eslint-disable-line no-unused-vars
import SETTINGS from '../settings';
import {
    ArchiveDetailContainer, // eslint-disable-line no-unused-vars
    ArchiveFilesContainer, // eslint-disable-line no-unused-vars
    ArchiveLoginContainer, // eslint-disable-line no-unused-vars
    ArchiveMissingContainer, // eslint-disable-line no-unused-vars
    ArchiveModalContainer, // eslint-disable-line no-unused-vars
    ArchiveNavbarContainer, // eslint-disable-line no-unused-vars
    ArchivePrivacyContainer, // eslint-disable-line no-unused-vars
    ArchiveSearchContainer, // eslint-disable-line no-unused-vars
} from '../containers';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const UPLOAD_ACTIVE_STATUSES = [UPLOAD_STATUSES.PENDING, UPLOAD_STATUSES.RUNNING];


class ArchiveApp extends React.Component {
    constructor(props) {
        super(props);
        this.store = createStore(reducer, props.initialState, props.reduxDevTools);

        // if the window global is defined (i.e. we're in a browser) handle the beforeunload event
        if (props.window) {
            props.window.addEventListener('beforeunload', this.handleUnload.bind(this));
        }
    }

    render() {
        return (
            <Provider store={this.store}>
                <div>
                    <ArchiveModalContainer store={ this.store } />
                    <ArchiveNavbarContainer store={ this.store } />
                    <div id="archive-content" className="container">
                        <Switch>
                            <RestrictedRoute
                                path="/"
                                component={ ArchiveSearchContainer }
                                store={ this.store }
                                exact
                            />
                            <RestrictedRoute
                                path="/detail/:id"
                                component={ ArchiveDetailContainer }
                                store={ this.store }
                            />
                            <RestrictedRoute
                                path="/files"
                                component={ ArchiveFilesContainer }
                                store={ this.store }
                            />
                            <Route
                                path="/login"
                                component={ ArchiveLoginContainer }
                            />
                            <Route
                                path="/privacy"
                                component={ ArchivePrivacyContainer }
                            />
                            <Route
                                component={ ArchiveMissingContainer }
                            />
                        </Switch>
                    </div>
                </div>
            </Provider>
        );
    }

    /*
     * Handle beforeunload event when user attempts to reload or navigate to a new page.
     * Prompt them to confirm if there are uploads in progress that would be interrupted.
     */
    handleUnload(event) {
        event.preventDefault();

        const state = this.store.getState();
        const uploadsInProgress = state.uploads.uploadsById.filter((uploadModel) => {
            return UPLOAD_ACTIVE_STATUSES.includes(uploadModel.status);
        });

        if (uploadsInProgress.isEmpty()) {
            return undefined;
        }

        const message = 'Are you sure you want to leave? Uploads in progress will be canceled.';
        event.returnValue = message;
        return message;
    }
}

ArchiveApp.propTypes = {
    initialState: PropTypes.object.isRequired,
};


export default ArchiveApp;
