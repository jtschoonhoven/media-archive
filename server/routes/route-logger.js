const expressWinston = require('express-winston');
const winston = require('winston');


// configure logger for route access
const routeLogger = expressWinston.logger({
    format: winston.format.printf((info) => {
        const status = info.meta.res.statusCode;
        const method = info.meta.req.method;
        const timeMs = info.meta.responseTime;
        const url = info.meta.req.url;
        return `HTTP ${status} ${method} ${timeMs}ms ${url}`;
    }),
    transports: [new winston.transports.Console()],
});


module.exports = routeLogger;
