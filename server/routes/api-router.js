const express = require('express');


// this router handles private API routes to serve data in JSON format
const apiRouter = express.Router();

// always require auth
apiRouter.use((req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 'error': 'Unauthorized' });
    }
    return next();
});

apiRouter.get('/user', (req, res) => res.json(req.user || {}));


module.exports = apiRouter;
