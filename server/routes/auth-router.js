const express = require('express');
const passport = require('passport');


// this router handles routes used for authorizing with oauth
const authRouter = express.Router();

authRouter.get(
    '/login',
    (req, res, next) => {
        if (req.query.return) {
            // Save the url of the user's current page so the app can redirect
            req.session.oauth2return = req.query.return;
        }
        return next();
    },
    passport.authenticate('google', { scope: ['email', 'profile'] }),
);

authRouter.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

authRouter.get(
    '/google/callback',
    passport.authenticate('google'),
    (req, res) => {
        const redirect = req.session.oauth2return || '/';
        delete req.session.oauth2return;
        res.redirect(redirect);
    },
);


module.exports = authRouter;
