const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const passport = require('passport');
const path = require('path');
const sessions = require('client-sessions');

const apiRouter = require('./routes/api-router');
const appRouter = require('./routes/app-router');
const authRouter = require('./routes/auth-router');
const authService = require('./services/auth');
const db = require('./services/database');
const logger = require('./services/logger');
const publicRouter = require('./routes/public-router');
const routeLogger = require('./routes/route-logger');
const settings = require('./settings');


// constants
const PORT = 8081; // nginx default
const SESSION_CONFIG = {
    secret: config.get('SESSION_SECRET'),
    cookieName: 'session', // key name on req object
    duration: 1000 * 60 * 60 * 24, // 24h in ms
    activeDuration: 1000 * 60 * 60 * 24, // automatically extend session on login
    secure: true,
};

// bootstrap database in dev
if (settings.NODE_ENV === 'development') {
    db.migrate(true).catch(logger.error);
}

// init app
const app = express();

// config app
app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(sessions(SESSION_CONFIG));
app.use(bodyParser.urlencoded({ extended: false }));

// config passport
passport.use(authService.googleStrategy);
passport.serializeUser(authService.serializeUser);
passport.deserializeUser(authService.deserializeUser);
app.use(passport.initialize());

// attach routers
app.use(routeLogger);
app.use(publicRouter);
app.use('/auth', authRouter);
app.use(passport.session()); // set session cookie only for api and appRouter
app.use('/api/v1', apiRouter);
app.use(appRouter);

// start server
app.listen(PORT, () => logger.info(`node server listening on http://localhost:${PORT}`));
