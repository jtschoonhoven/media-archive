const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const passport = require('passport');
const path = require('path');
const sessions = require('client-sessions');

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const authService = require('./services/auth');
const logger = require('./services/logger');
const publicRouter = require('./routes/public');
const routeLogger = require('./routes/route-logger');

// constants
const PORT = 8081; // nginx default
const SESSION_CONFIG = {
    secret: config.get('SESSION_SECRET'),
    cookieName: 'session', // key name on req object
    duration: 1000 * 60 * 60 * 24, // 24h in ms
    activeDuration: 1000 * 60 * 60 * 24, // automatically extend session on login
    secure: true,
};

// testing
const db = require('./services/database');
db.migrate()
    .then(() => db.all('SELECT * FROM media'))
    .then(console.log)
    .catch(console.log);

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
app.use(passport.session());

// attach routers
app.use(routeLogger);
app.use(authRouter);
app.use(apiRouter);
app.use(publicRouter); // must be last: contains a '*' route

// start server
app.listen(PORT, () => logger.info(`node server listening on http://localhost:${PORT}`));
