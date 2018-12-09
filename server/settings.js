const config = require('config');


// app
module.exports.NODE_ENV = config.get('NODE_ENV', 'development');

// oauth
module.exports.OAUTH2_CLIENT_ID = config.get('OAUTH2_CLIENT_ID');
module.exports.OAUTH2_CLIENT_SECRET = config.get('OAUTH2_CLIENT_SECRET');
module.exports.OAUTH2_CALLBACK = config.get('OAUTH2_CALLBACK');
