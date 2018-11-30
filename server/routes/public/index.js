const express = require('express');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app = require('../../../dist/bundle.server.js');


// constants
const STATIC_PATH = path.resolve(__dirname, '../../../dist');
const STATIC_OPTS = { maxAge: '5s' };


// this router handles public routes including the react frontend
const publicRouter = express.Router();

publicRouter.use(express.static(STATIC_PATH, STATIC_OPTS));

publicRouter.get('/healthcheck', (req, res) => {
    res.send('OK');
});

publicRouter.get('*', (req, res) => {
    const initialState = { user: req.user || {} };
    // https://reacttraining.com/react-router/web/guides/server-rendering
    const context = {};
    const html = ReactDOMServer.renderToString(
        React.createElement(app.default, { location: req.url, initialState, context }),
    );
    if (context.url) {
        return res.redirect(301, context.url);
    }
    return res.render('index', { INITIAL_STATE: initialState, HTML: html });
});


module.exports = publicRouter;
