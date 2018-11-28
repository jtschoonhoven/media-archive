const path = require('path');
const express = require('express');
const requireLogin = require('../../services/auth').requireLogin;

// constants
const STATIC_PATH = path.resolve(__dirname, '../../../dist');
const STATIC_OPTS = { maxAge: '5s' };

// this router handles public routes including the react frontend
const publicRouter = express.Router();

publicRouter.use(express.static(STATIC_PATH, STATIC_OPTS));

publicRouter.get('/healthcheck', (req, res) => {
    res.send('OK');
});

publicRouter.get('/login', (req, res) => {
    if (req.user && req.user.isLoggedIn) {
        const redirectUrl = req.session.oauth2return;
        return res.redirect(redirectUrl || '/');
    }
    return res.sendFile(path.resolve(STATIC_PATH, 'login.html'));
});

publicRouter.get('/privacy', (req, res) => {
    res.sendFile(path.resolve(STATIC_PATH, 'privacy.html'));
});

publicRouter.get('*', requireLogin, (req, res) => {
    res.render('index', { INITIAL_STATE: { user: req.user || {} } });
});


module.exports = publicRouter;
