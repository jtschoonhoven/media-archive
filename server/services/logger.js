const winston = require('winston');


// configure logger for route access
module.exports = winston.createLogger({
    format: winston.format.printf(info => `${info.level.toUpperCase()} ${info.message}`),
    transports: [new winston.transports.Console()],
});
