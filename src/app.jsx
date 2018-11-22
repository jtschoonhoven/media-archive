import { history as backboneHistory, Router as BackboneRouter } from 'backbone';
import React from 'react'; // eslint-disable-line no-unused-vars
import { render } from 'react-dom';

import './styles/main.scss';
import { ArchiveLogin, ArchiveNavbar, ArchiveNotFound, ArchiveSearch } from './components'; // eslint-disable-line no-unused-vars


// get root elements from DOM
const CONTENT_ROOT = document.getElementById('archive-content');
const NAVBAR_ROOT = document.getElementById('archive-navbar');


// render navbar
render(<ArchiveNavbar />, NAVBAR_ROOT);


// define routes
class ArchiveRouter extends BackboneRouter {
    routes() {
        return {
            '': 'search',
            'search': 'search',
            'login': 'login',
            'logout': 'login',
            '*notFound': 'notFound',
        };
    }

    login() {
        render(<ArchiveLogin />, CONTENT_ROOT);
    }

    search() {
        render(<ArchiveSearch />, CONTENT_ROOT);
    }

    notFound() {
        render(<ArchiveNotFound />, CONTENT_ROOT);
    }
}


// initialize router
new ArchiveRouter(); // eslint-disable-line no-unused-vars


// start browser history
backboneHistory.start({ pushState: true });
