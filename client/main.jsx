import './browser-shim';
import './styles/main.scss';

import React from 'react'; // eslint-disable-line no-unused-vars
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // eslint-disable-line no-unused-vars
import { Provider } from 'react-redux'; // eslint-disable-line no-unused-vars
import { render } from 'react-dom';

import store from './store'; // eslint-disable-line no-unused-vars
import {
    ArchiveDetailContainer, // eslint-disable-line no-unused-vars
    ArchiveLoginContainer, // eslint-disable-line no-unused-vars
    ArchiveMissingContainer, // eslint-disable-line no-unused-vars
    ArchiveNavbarContainer, // eslint-disable-line no-unused-vars
    ArchivePrivacyContainer, // eslint-disable-line no-unused-vars
    ArchiveSearchContainer, // eslint-disable-line no-unused-vars
    ArchiveUploadContainer, // eslint-disable-line no-unused-vars
} from './containers';


// get root elements from DOM
const CONTENT_ROOT = document.getElementById('archive-main');


class ArchiveRouter extends React.Component { // eslint-disable-line no-unused-vars
    render() {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    <div>
                        <ArchiveNavbarContainer store={store} />
                        <div id="archive-content" className="container">
                            <Switch>
                                <Route path="/" exact component={ArchiveSearchContainer} />
                                <Route path="/detail/:id" component={ArchiveDetailContainer} />
                                <Route path="/upload" component={ArchiveUploadContainer} />
                                <Route path="/login" component={ArchiveLoginContainer} />
                                <Route path="/privacy" component={ArchivePrivacyContainer} />
                                <Route component={ArchiveMissingContainer} />
                            </Switch>
                        </div>
                    </div>
                </BrowserRouter>
            </Provider>
        );
    }
}

render(<ArchiveRouter />, CONTENT_ROOT);
