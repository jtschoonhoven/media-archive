const config = require('config');


// app
module.exports.NODE_ENV = config.get('NODE_ENV', 'development');
