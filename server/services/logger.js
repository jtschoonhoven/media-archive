const winston = require('winston');
const expressWinston = require('express-winston');

const TRANSPORTS = [new winston.transports.Console()];


// configure app-level logging
const logger = winston.createLogger({
    format: winston.format.printf(info => {
        return `${ info.level.toUpperCase() } ${ info.stack || info.message }`
    }),
    transports: TRANSPORTS,
});

// configure route-level logging
const routeLogger = expressWinston.logger({
    format: winston.format.printf((info) => {
        const status = info.meta.res.statusCode;
        const method = info.meta.req.method;
        const timeMs = info.meta.responseTime;
        const url = info.meta.req.url;
        return `HTTP ${status} ${method} ${timeMs}ms ${url}`;
    }),
    transports: TRANSPORTS,
});


module.exports = logger;
module.exports.routeLogger = routeLogger;
