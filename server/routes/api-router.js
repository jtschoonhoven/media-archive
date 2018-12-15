const express = require('express');
const Joi = require('joi');

const authService = require('../services/auth');
const filesService = require('../services/files');
const logger = require('../services/logger');
const s3Service = require('../services/s3');
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
 * Validate request object against Joi schema.
 * Must be bound to a schema with `validateReq.bind(null, SCHEMA)`
 */
function validateReq(schema, req, res, next) {
    const result = Joi.validate(req, schema);
    if (result.error) {
        const errorStr = result.error.details[0].message;
        logger.warn(`bad API request on ${req.url}: ${errorStr}`);
        return res.status(400).json({ error: errorStr });
    }
    return next();
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
const SEARCH_SCHEMA = Joi.object({
    query: Joi.object({
        s: Joi.string().regex(/^[0-9a-zA-Z _(&|!)-]+$/).required()
            .error(() => 'Search string must be letters, numbers, or the logical operators (!|&)'),
        limit: Joi.number().integer().min(1).max(100)
            .error(() => 'Limit must be an integer between 1 and 100'),
        nextKey: Joi.string().hex()
            .error(() => 'nextKey param must be a hexadecimal'),
        prevKey: Joi.string().hex()
            .error(() => 'prevKey param must be a hexadecimal'),
    }),
}).unknown();

apiRouter.get('/search', validateReq.bind(null, SEARCH_SCHEMA), async (req, res) => {
    const { s, ...filters } = req.query;
    return sendResponse(req, res, searchService.query, s, filters);
});

/*
 * Files API (GET).
 * Query the database for a list of files and directories at a given path.
 */
const FILES_SCHEMA = Joi.object({
    params: Joi.object({
        path: Joi.string().uri({ allowRelative: true }).allow('').required()
            .error(() => 'Files API requires a valid directory path.'),
    }).unknown(),
}).unknown();

apiRouter.get('/files/:path(*)', validateReq.bind(null, FILES_SCHEMA), async (req, res) => {
    const path = req.params.path;
    return sendResponse(req, res, filesService.load, path);
});

/*
 * Uploads API (POST).
 * Initiate a file upload to the given directory and save it as "pending" in the db.
 * Does not receive the file directly. Instead returns signed tokens for upload to S3.
 */
const UPLOADS_SCHEMA = Joi.object({
    params: Joi.object({
        path: Joi.string().uri({ allowRelative: true }).required()
            .error(() => 'Uploads API requires a valid directory path.'),
    }).unknown(),
    body: Joi.object({
        files: Joi.array().items(
            Joi.object({
                name: Joi.string().regex(/^[0-9a-zA-Z ._-]+$/).required()
                    .error(() => 'File must be letters, numbers, dashes, underscores, or spaces.'),
                sizeInBytes: Joi.number().integer().min(0)
                    .error(() => 'File size must be a positive integer.'),
            }),
        ),
    }),
}).unknown();

apiRouter.post('/files/:path(*)', validateReq.bind(null, UPLOADS_SCHEMA), async (req, res) => {
    const dirPath = req.params.path;
    const fileList = req.body.files;
    return sendResponse(req, res, uploadsService.upload, dirPath, fileList);
});

/*
 * S3 API.
 * Endpoint to receive signed S3 policy for direct HTTP upload.
 */
apiRouter.get('/s3/policy', authService.requireLogin, (req, res) => {
    return sendResponse(req, res, s3Service.getPolicy);
});


module.exports = apiRouter;
