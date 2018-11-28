const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const authService = require('./services/auth');
const logger = require('./services/logger');
const publicRouter = require('./routes/public');
const routeLogger = require('./routes/route-logger');


// constants
const PORT = 8081; // nginx default

// init app
const app = express();

// config app
app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(session({ secret: config.get('SESSION_SECRET') }));
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
app.listen(PORT, () => logger.info(`server listening on http://localhost:${PORT}`));
