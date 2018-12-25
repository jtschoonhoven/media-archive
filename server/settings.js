// FIXME: remove this module and just call config.get directly as needed
const config = require('config');


// app
module.exports.NODE_ENV = config.get('NODE_ENV', 'development');
module.exports.BASE_URL = config.get('BASE_URL');

// oauth
module.exports.OAUTH2_CLIENT_ID = config.get('OAUTH2_CLIENT_ID');
module.exports.OAUTH2_CLIENT_SECRET = config.get('OAUTH2_CLIENT_SECRET');
