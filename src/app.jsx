import { history as backboneHistory, Router as BackboneRouter } from 'backbone';
import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';

import './styles/main.scss';
import { ArchiveLogin, ArchiveNavbar, ArchiveNotFound } from './components'; // eslint-disable-line no-unused-vars


const contentRoot = document.getElementById('archive-content');
const navbarRoot = document.getElementById('archive-navbar');

ReactDOM.render(<ArchiveNavbar />, navbarRoot);

class ArchiveRouter extends BackboneRouter {
    routes() {
        return {
            '': 'login',
            'login': 'login',
            '*notFound': 'notFound',
        };
    }

    login() {
        ReactDOM.render(<ArchiveLogin />, contentRoot);
    }

    notFound() {
        ReactDOM.render(<ArchiveNotFound />, contentRoot);
    }
}

new ArchiveRouter(); // eslint-disable-line no-unused-vars
backboneHistory.start({ pushState: true });
