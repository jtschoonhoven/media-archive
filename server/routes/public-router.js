const express = require('express');
const path = require('path');


// constants
const STATIC_PATH = path.resolve(__dirname, '../../dist');
const STATIC_OPTS = { maxAge: '5s' };

// this router handles public static routes
const publicRouter = express.Router();

publicRouter.use(express.static(STATIC_PATH, STATIC_OPTS));

publicRouter.get('/healthcheck', (req, res) => {
    res.send('OK');
});


module.exports = publicRouter;
