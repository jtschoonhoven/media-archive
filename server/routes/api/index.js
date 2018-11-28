const express = require('express');


// this router handles private API routes to serve data in JSON format
const apiRouter = express.Router();


apiRouter.get('/api/user', (req, res) => {
    res.json(req.user || {});
});


module.exports = apiRouter;
