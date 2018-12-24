const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Joi = require('joi');

const logger = require('./logger');
const settings = require('../settings');

const OAUTH2_CONFIG = {
    clientID: settings.OAUTH2_CLIENT_ID,
    clientSecret: settings.OAUTH2_CLIENT_SECRET,
    callbackURL: settings.OAUTH2_CALLBACK,
    accessType: 'offline',
};

const USER_SCHEMA = Joi.object({
    isLoggedIn: Joi.boolean(),
    email: Joi.string().email(),
});

/*
 * Middleware to conditionally apply settings depending on the environment.
 */
module.exports.envConfig = (req, res, next) => {
    if (settings.NODE_ENV === 'development') {
        req.user = { isLoggedIn: true, email: 'fake@leakeyfoundation.org' };
    }
    next();
};

/*
 * Simple middleware to redirect to login page is user is not authorized.
 */
module.exports.requireLogin = (req, res, next) => {
    if (settings.NODE_ENV === 'development') {
        logger.warn('bypassing login in development');
        return next();
    }
    // continue if authorized with valid user schema
    if (!Joi.validate(req.user, USER_SCHEMA).error) {
        return next();
    }
    // redirect to login page for all other routes
    req.session.oauth2return = req.originalUrl;
    return res.redirect('/login');
};

/*
 * Parse the serialized user object and restore to req.user.
 */
module.exports.deserializeUser = (userStr, done) => {
    try {
        const user = JSON.parse(userStr);
        done(null, user);
    }
    catch (err) {
        done(err);
    }
};

/*
 * Serialize the user object to a session cookie.
 * Typically this would only serialize an ephemeral session ID, but we're using
 * client-sessions to store user state on the client, rather than Redis or similar.
 * See https://mzl.la/15CLx3Q for a complete explanation.
 */
module.exports.serializeUser = (user, done) => {
    done(null, JSON.stringify(user)); // saved to session token
};

/*
 * Configure OAuth2 and callback behavior.
 * The verification callback receives access tokens and profile info for the given user
 * which are set to req.user and serialized to a session cookie.
 */
module.exports.googleStrategy = new GoogleStrategy(
    OAUTH2_CONFIG,
    (accessToken, refreshToken, profile, done) => {
        const user = { // this will be set to req.user
            id: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            imgUrl: profile.photos.length ? profile.photos[0].value : undefined,
            isLoggedIn: true,
            _salt: crypto.randomBytes(64).toString('base64'), // FIXME: generate bytes async
        };
        done(null, user);
    },
);
