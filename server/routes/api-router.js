const express = require('express');
const Joi = require('joi');

const filesService = require('../services/files');
const logger = require('../services/logger');
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
async function sendResponse(successStatusCode, req, res, func, ...args) {
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
    return res.status(successStatusCode).json(result);
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
    return sendResponse(200, req, res, searchService.query, s, filters);
});

/*
 * File Detail API
 * Retrieve a media item from S3 and display metadata from the DB.
 */
const FILE_VIEW_SCHEMA = Joi.object({
    params: Joi.object({
        fileId: Joi.number().integer().min(1).required()
            .error(() => 'File View API requires a valid file ID.'),
    }).unknown(),
}).unknown();

apiRouter.get('/detail/:fileId', validateReq.bind(null, FILE_VIEW_SCHEMA), async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);
    return sendResponse(200, req, res, filesService.detail, fileId);
});

/*
 * File List API.
 * Query the database for a list of files and directories at a given path.
 */
const FILE_LIST_SCHEMA = Joi.object({
    params: Joi.object({
        path: Joi.string().uri({ allowRelative: true }).allow('').required()
            .error(() => 'Files API requires a valid directory path.'),
    }).unknown(),
}).unknown();

apiRouter.get('/files/:path(*)', validateReq.bind(null, FILE_LIST_SCHEMA), async (req, res) => {
    const path = req.params.path;
    return sendResponse(200, req, res, filesService.load, path, req.user.email);
});

/*
 * Uploads API.
 * Initiate a file upload to the given directory and save it as "pending" in the db.
 * Does not receive the file directly. Instead returns signed tokens for upload to S3.
 */
const UPLOADS_SCHEMA = Joi.object({
    params: Joi.object({
        path: Joi.string().uri({ allowRelative: true }).required()
            .error((validationError) => {
                if (validationError[0].type === 'any.empty') {
                    return 'Cannot upload to the root directory: please choose a child folder.';
                }
                return 'Uploads API requires a valid directory path.';
            }),
    }).unknown(),
    body: Joi.object({
        files: Joi.array().items(
            Joi.object({
                name: Joi.string().regex(/^[0-9a-zA-Z ._-]+$/).required()
                    .error(() => 'File name must be alphanumeric or have dashes and spaces.'),
                sizeInBytes: Joi.number().integer().min(0)
                    .error(() => 'File size must be a positive integer.'),
            }),
        ),
    }),
}).unknown();

apiRouter.post('/files/:path(*)', validateReq.bind(null, UPLOADS_SCHEMA), async (req, res) => {
    const dirPath = req.params.path;
    const fileList = req.body.files;
    return sendResponse(201, req, res, uploadsService.upload, dirPath, fileList, req.user.email);
});

/*
 * Upload Cancel API.
 * Cancel a pending upload by its ID.
 */
const CANCEL_SCHEMA = Joi.object({
    params: Joi.object({
        fileId: Joi.number().integer().min(1).required()
            .error(() => 'File Delete API requires a valid file ID.'),
    }).unknown(),
}).unknown();

apiRouter.delete('/uploads/:fileId', validateReq.bind(null, CANCEL_SCHEMA), async (req, res) => {
    const fileId = req.params.fileId;
    return sendResponse(200, req, res, uploadsService.cancel, fileId, req.user.email);
});

/*
 * File Delete API.
 * Delete a file from the database by its ID.
 */
const DELETE_SCHEMA = Joi.object({
    params: Joi.object({
        fileId: Joi.number().integer().min(1).required()
            .error(() => 'File Delete API requires a valid file ID.'),
    }).unknown(),
}).unknown();

apiRouter.delete('/files/:fileId', validateReq.bind(null, DELETE_SCHEMA), async (req, res) => {
    const fileId = req.params.fileId;
    return sendResponse(200, req, res, filesService.delete, fileId);
});


module.exports = apiRouter;
