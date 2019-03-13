import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ArchiveApp from './components/routes';
import { State } from './types';
import SETTINGS from './settings';

declare global {
    interface Window {
        INITIAL_STATE: State;
        __REDUX_DEVTOOLS_EXTENSION__: () => void;
    }
}


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


/*
 * Hack Redux DevTools to print contents of native Map object.
 * https://github.com/zalmoxisus/redux-devtools-extension/issues/124#issuecomment-221972997
 */
if (SETTINGS.NODE_ENV === 'development') {
    // eslint-disable-next-line no-extend-native, @typescript-eslint/no-explicit-any, func-names
    (Map.prototype as any).toJSON = function () {
        const result = {};
        this.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    };
}
