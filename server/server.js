const express = require('express');
const path = require('path');


const PORT = 8081; // nginx default
const STATIC_PATH = path.resolve(__dirname, '../dist');
const HTML_PATH = path.resolve(__dirname, '../dist/index.html');
const HTML_OPTS = {};

// init app
const app = express();

// healthcheck always returns 200
app.get('/healthcheck', (req, res) => {
    res.send('OK');
});

// first attempt to resolve URL to file in static dir
app.use(express.static(STATIC_PATH));

// if no file matches URL in static dir, resolve to app
app.get('*', (req, res) => {
    res.sendFile(HTML_PATH, HTML_OPTS);
});

// start server
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));