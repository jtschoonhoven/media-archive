const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const path = require('path');
const session = require('cookie-session');
const { createTerminus } = require('@godaddy/terminus');

const apiRouter = require('./routes/api-router');
const appRouter = require('./routes/app-router');
const authRouter = require('./routes/auth-router');
const authService = require('./services/auth');
const db = require('./services/database');
const logger = require('./services/logger');

// constants
const PORT = 8081; // nginx default
const STATIC_PATH = path.resolve(__dirname, '../dist');
const STATIC_OPTS = { maxAge: '5s' };
const SESSION_CONFIG = {
    name: 'session',
    keys: [config.get('SESSION_SECRET')],
    maxAge: 1000 * 60 * 60 * 24, // 24h in ms
    sameSite: 'lax',
};
const NODE_ENV = config.get('NODE_ENV');


// bootstrap database with test data for development
// FIXME: remove when ready
// db.rebuild({ force: true })
//     .then(() => db.get('SELECT COUNT(1) FROM media'))
//     .then(res => logger.info(`loaded ${res.count} records`))
//     .catch(logger.error);

// init server
const app = express();

// config app
app.use(helmet()); // sets HTTP headers to avoid common exploits
app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(session(SESSION_CONFIG));
app.use(bodyParser.urlencoded({ extended: false })); // parse query params
app.use(bodyParser.json()); // parse POST body
app.use(authService.envConfig);

// config passport
passport.use(authService.googleStrategy);
passport.serializeUser(authService.serializeUser);
passport.deserializeUser(authService.deserializeUser);
app.use(passport.initialize());

// attach routers
app.use(logger.routeLogger);
app.use(express.static(STATIC_PATH, STATIC_OPTS));
app.use('/auth', authRouter);
app.use(passport.session()); // set session cookie only for api and appRouter
app.use('/api/v1', apiRouter);
app.use(appRouter);

// start server
const server = app.listen(PORT, () => {
    logger.info(`${NODE_ENV} node server listening on http://localhost:${PORT}`);
});

// configure graceful shutdown and healthchecks
createTerminus(
    server,
    {
        signal: 'SIGINT',
        healthChecks: { '/healthcheck': () => Promise.resolve() },
        onShutdown: () => {
            logger.info('node app gracefully shutting down');
            db.close();
        },
        logger: err => logger.error(err.stack),
    },
);
