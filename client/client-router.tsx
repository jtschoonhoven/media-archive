import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ArchiveApp from './components/routes';
import SETTINGS from './settings';
import { Window } from './types';

declare const window: Window;


export default function ClientRouter(): React.ReactElement<BrowserRouter> {
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
