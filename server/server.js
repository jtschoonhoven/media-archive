const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const path = require('path');
const session = require('express-session');

// constants
const PORT = 8081; // nginx default
const STATIC_PATH = path.resolve(__dirname, '../dist');
const STATIC_OPTS = { maxAge: '5s' };
const HTML_PATH = path.resolve(__dirname, '../dist/index.html');
const HTML_OPTS = { maxAge: '5s' };

// init app
const app = express();

// config app
app.use(express.static(STATIC_PATH, STATIC_OPTS));
app.use(session({ secret: config.get('SESSION_SECRET') }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// healthcheck always returns 200
app.get('/healthcheck', (req, res) => {
    res.send('OK');
});

app.get(
    '/auth/login',
    // Save the url of the user's current page so the app can redirect back to
    // it after authorization
    (req, res, next) => {
        if (req.query.return) {
            req.session.oauth2return = req.query.return;
        }
        next();
    },
    passport.authenticate('google', { scope: ['email'] }),
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
        const redirect = req.session.oauth2return || '/';
        delete req.session.oauth2return;
        res.redirect(redirect);
    },
);

// if no file matches URL in static dir, resolve to app
app.get('*', (req, res) => {
    res.sendFile(HTML_PATH, HTML_OPTS);
});

// start server
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));


function extractProfile(profile) {
    let imageUrl = '';
    if (profile.photos && profile.photos.length) {
        imageUrl = profile.photos[0].value;
    }
    return {
        id: profile.id,
        displayName: profile.displayName,
        image: imageUrl,
    };
}

// Configure the Google strategy for use by Passport.js.
//
// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GoogleStrategy({
    clientID: config.get('OAUTH2_CLIENT_ID'),
    clientSecret: config.get('OAUTH2_CLIENT_SECRET'),
    callbackURL: config.get('OAUTH2_CALLBACK'),
    accessType: 'offline',
}, (accessToken, refreshToken, profile, cb) => {
// Extract the minimal profile information we need from the profile object
// provided by Google
    cb(null, extractProfile(profile));
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

// function authRequired (req, res, next) {
//   if (!req.user) {
//     req.session.oauth2return = req.originalUrl;
//     return res.redirect('/auth/login');
//   }
//   next();
// }
