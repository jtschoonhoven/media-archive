import './style.scss';

import * as React from 'react';
import { createStore, Store, StoreEnhancerStoreCreator } from 'redux';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import reducer from '../reducers';
import RestrictedRoute from './common/restricted';
import SETTINGS from '../settings';
import { Action, State, Window } from '../types';
import {
    ArchiveDetailContainer,
    ArchiveFilesContainer,
    ArchiveLoginContainer,
    ArchiveMissingContainer,
    ArchiveModalContainer,
    ArchiveNavbarContainer,
    ArchivePrivacyContainer,
    ArchiveSearchContainer,
} from '../containers';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const UPLOAD_ACTIVE_STATUSES = [UPLOAD_STATUSES.PENDING, UPLOAD_STATUSES.RUNNING];

interface Props {
    initialState: State;
    reduxDevTools?: () => StoreEnhancerStoreCreator;
    window?: Window;
}


export default class ArchiveApp extends React.Component<Props> {
    store: Store;

    constructor(props: Props) {
        super(props);
        if (props.reduxDevTools) {
            this.store = createStore<State, Action, any, any>(
                reducer,
                props.initialState,
                props.reduxDevTools,
            );
        }
        else {
            this.store = createStore<State, Action, any, any>(
                reducer,
                props.initialState,
            );
        }

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
                                exact={ true }
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
