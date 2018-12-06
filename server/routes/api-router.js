const express = require('express');

const logger = require('../services/logger');
const searchService = require('../services/search');


// this router handles private API routes to serve data in JSON format
const apiRouter = express.Router();

/*
 * Middleware to require auth for all API routes.
 */
apiRouter.use((req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 'error': 'Unauthorized' });
    }
    return next();
});

/*
 * Return the current user object.
 */
apiRouter.get('/user', (req, res) => {
    if (!req.user) {
        const err = 'Failed to retrieve data for current user.';
        logger.error(err);
        return res.status(500).json({ error: err });
    }
    return res.json(req.user);
});

/*
 * Query the database with a search term and filters and return matching media.
 */
apiRouter.get('/search', async (req, res) => {
    const { s, ...filters } = req.query;
    let result;
    try {
        result = await searchService.query(s, filters);
    }
    catch (err) {
        logger.error(err.stack);
        result = { error: 'Server error.' };
    }
    if (result.error) {
        logger.error(`error on search API: ${result.error}`);
        return res.status(500).json(result);
    }
    return res.json(result);
});


module.exports = apiRouter;
