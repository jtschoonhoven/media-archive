import './styles/main.scss';

import React from 'react'; // eslint-disable-line no-unused-vars
import { history as backboneHistory, Router as BackboneRouter } from 'backbone';
import { render } from 'react-dom';

import store from './store'; // eslint-disable-line no-unused-vars
import {
    ArchiveDetailContainer, // eslint-disable-line no-unused-vars
    ArchiveNavbarContainer, // eslint-disable-line no-unused-vars
    ArchiveMissingContainer, // eslint-disable-line no-unused-vars
    ArchiveSearchContainer, // eslint-disable-line no-unused-vars
    ArchiveUploadContainer, // eslint-disable-line no-unused-vars
} from './containers';


// get root elements from DOM
const CONTENT_ROOT = document.getElementById('archive-content');
const NAVBAR_ROOT = document.getElementById('archive-navbar');


// render navbar
render(<ArchiveNavbarContainer store={store} />, NAVBAR_ROOT);


// define routes
class ArchiveRouter extends BackboneRouter {
    routes() {
        return {
            '': 'search',
            'search': 'search',
            'detail/:id': 'detail',
            'upload': 'upload',
            'login': undefined, // server handles these routes
            'logout': undefined,
            'privacy': undefined,
            '*notFound': 'notFound',
        };
    }

    search() {
        render(<ArchiveSearchContainer store={store} />, CONTENT_ROOT);
    }

    detail() {
        render(<ArchiveDetailContainer store={store} />, CONTENT_ROOT);
    }

    upload() {
        render(<ArchiveUploadContainer store={store} />, CONTENT_ROOT);
    }

    notFound() {
        render(<ArchiveNotFoundContainer store={store} />, CONTENT_ROOT);
    }
}


// initialize router
new ArchiveRouter();


// start browser history
backboneHistory.start({ pushState: true });
