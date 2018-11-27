import './styles/main.scss';

import React from 'react'; // eslint-disable-line no-unused-vars
import { history as backboneHistory, Router as BackboneRouter } from 'backbone';
import { render } from 'react-dom';

import {
    ArchiveDetail, // eslint-disable-line no-unused-vars
    ArchiveLogin, // eslint-disable-line no-unused-vars
    ArchiveNavbar, // eslint-disable-line no-unused-vars
    ArchiveNotFound, // eslint-disable-line no-unused-vars
    ArchivePrivacyPolicy, // eslint-disable-line no-unused-vars
    ArchiveSearch, // eslint-disable-line no-unused-vars
    ArchiveUpload, // eslint-disable-line no-unused-vars
} from './components';


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
            'detail/:id': 'detail',
            'upload': 'upload',
            'login': 'login',
            'logout': 'login',
            'privacy': 'privacy',
            '*notFound': 'notFound',
        };
    }

    search() {
        render(<ArchiveSearch />, CONTENT_ROOT);
    }

    detail() {
        render(<ArchiveDetail />, CONTENT_ROOT);
    }

    upload() {
        render(<ArchiveUpload />, CONTENT_ROOT);
    }

    login() {
        render(<ArchiveLogin />, CONTENT_ROOT);
    }

    privacy() {
        render(<ArchivePrivacyPolicy />, CONTENT_ROOT);
    }

    notFound() {
        render(<ArchiveNotFound />, CONTENT_ROOT);
    }
}


// initialize router
new ArchiveRouter();


// start browser history
backboneHistory.start({ pushState: true });
