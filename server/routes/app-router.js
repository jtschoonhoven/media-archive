const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app = require('../../dist/bundle.server.js').default;


// this router serves the react frontend
const appRouter = express.Router();

/*
 * Serve the React frontend on any route not explicitly reserved for the server.
 * For an explanation of server rendering and context, see
 * https://reacttraining.com/react-router/web/guides/server-rendering
 */
appRouter.get('*', (req, res) => {
    const initialState = { user: req.user || {} };
    // https://reacttraining.com/react-router/web/guides/server-rendering
    const context = {};
    const html = ReactDOMServer.renderToString(
        React.createElement(app, { location: req.url, initialState, context }),
    );
    if (context.url) {
        return res.redirect(301, context.url);
    }
    return res.render('index', { INITIAL_STATE: initialState, HTML: html });
});


module.exports = appRouter;
