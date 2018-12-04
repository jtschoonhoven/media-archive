import PropTypes from 'prop-types';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux'; // eslint-disable-line no-unused-vars
import { Route, Switch } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import reducer from '../reducers';
import RestrictedRoute from './common'; // eslint-disable-line no-unused-vars
import {
    ArchiveDetailContainer, // eslint-disable-line no-unused-vars
    ArchiveLoginContainer, // eslint-disable-line no-unused-vars
    ArchiveMissingContainer, // eslint-disable-line no-unused-vars
    ArchiveNavbarContainer, // eslint-disable-line no-unused-vars
    ArchivePrivacyContainer, // eslint-disable-line no-unused-vars
    ArchiveSearchContainer, // eslint-disable-line no-unused-vars
    ArchiveUploadContainer, // eslint-disable-line no-unused-vars
} from '../containers';


class ArchiveApp extends React.Component {
    constructor(props) {
        super(props);
        this.store = createStore(reducer, props.initialState);
    }

    render() {
        return (
            <Provider store={this.store}>
                <div>
                    <ArchiveNavbarContainer />
                    <div id="archive-content" className="container">
                        <Switch>
                            <RestrictedRoute path="/" exact component={ArchiveSearchContainer} store={this.store} />
                            <RestrictedRoute path="/detail/:id" component={ArchiveDetailContainer} store={this.store} />
                            <RestrictedRoute path="/upload" component={ArchiveUploadContainer} store={this.store} />
                            <Route path="/login" component={ArchiveLoginContainer} />
                            <Route path="/privacy" component={ArchivePrivacyContainer} />
                            <Route component={ArchiveMissingContainer} />
                        </Switch>
                    </div>
                </div>
            </Provider>
        );
    }
}

ArchiveApp.propTypes = {
    initialState: PropTypes.object.isRequired,
};


export default ArchiveApp;
