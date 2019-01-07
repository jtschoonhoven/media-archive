import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import ArchiveApp from './components/routes.jsx'; // eslint-disable-line no-unused-vars
import SETTINGS from './settings';


function ClientRouter() {
    // include redux devtools in development if available
    let reduxDevTools;
    if (SETTINGS.NODE_ENV === 'development') {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
            reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__();
        }
    }
    return (
        <BrowserRouter>
            <ArchiveApp
                reduxDevTools={ reduxDevTools }
                initialState={ window.INITIAL_STATE }
                window={ window }
            />
        </BrowserRouter>
    );
}


// attach event listeners to server-rendered HTML
const CONTENT_ROOT = document.getElementById('archive-main');
ReactDom.hydrate(<ClientRouter />, CONTENT_ROOT);


export default ClientRouter;
