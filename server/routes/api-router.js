const express = require('express');

const logger = require('../services/logger');
const filesService = require('../services/files');
const searchService = require('../services/search');
const uploadsService = require('../services/uploads');


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
 * Handle error or return result of `func` in JSON response body.
 */
async function sendResponse(req, res, func, ...args) {
    let result;
    try {
        result = await func(...args);
    }
    catch (err) {
        logger.error(err.stack);
        result = { error: 'Server error.' };
    }
    if (result.error) {
        logger.error(`API error on ${req.url}: ${result.error}`);
        return res.status(500).json(result);
    }
    return res.json(result);
}

/*
 * User API.
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
 * Search API.
 * Query the database with a search term and filters and return matching media.
 */
apiRouter.get('/search', async (req, res) => {
    const { s, ...filters } = req.query;
    return sendResponse(req, res, searchService.query, s, filters);
});

/*
 * Files API (GET).
 * Query the database for a list of files and directories at a given path.
 */
apiRouter.get('/files/:path(*)', async (req, res) => {
    const path = req.params.path;
    return sendResponse(req, res, filesService.load, path);
});

/*
 * Files API (POST).
 * Initiate a file upload to the given directory and save it as "pending" in the db.
 * Does not receive the file directly. Instead returns signed tokens for upload to S3.
 */
apiRouter.post('/files/:path(*)', async (req, res) => {
    const dirPath = req.params.path;
    const fileList = req.body.files;
    return sendResponse(req, res, uploadsService.upload, dirPath, fileList);
});


module.exports = apiRouter;
