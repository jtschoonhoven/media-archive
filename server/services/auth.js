const config = require('config');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


// middleware to redirect to login page if user is not authorized
module.exports.requireLogin = (req, res, next) => {
    if (!req.user) {
        req.session.oauth2return = req.originalUrl;
        return res.redirect('/login');
    }
    return next();
};

module.exports.deserializeUser = (userStr, done) => {
    const user = JSON.parse(userStr);
    done(null, user); // restored to req.user
};

module.exports.serializeUser = (user, done) => {
    done(null, JSON.stringify(user)); // saved to session token
};

// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication
module.exports.googleStrategy = new GoogleStrategy({
    clientID: config.get('OAUTH2_CLIENT_ID'),
    clientSecret: config.get('OAUTH2_CLIENT_SECRET'),
    callbackURL: config.get('OAUTH2_CALLBACK'),
    accessType: 'offline',
}, (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        imgUrl: profile.photos.length ? profile.photos[0].value : undefined,
        isLoggedIn: true,
    };
    done(null, user);
});
