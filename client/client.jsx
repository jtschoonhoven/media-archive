import 'bootstrap/scss/bootstrap.scss';
import './components/style.scss';

import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import ArchiveApp from './main.jsx'; // eslint-disable-line no-unused-vars


class ClientApp extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <ArchiveApp initialState={window.INITIAL_STATE}/>
            </BrowserRouter>
        );
    }
}


// attach event listeners to server-rendered HTML
const CONTENT_ROOT = document.getElementById('archive-main');
ReactDom.hydrate(<ClientApp />, CONTENT_ROOT);


export default ClientApp;
