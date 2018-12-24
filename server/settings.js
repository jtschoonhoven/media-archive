const config = require('config');


// app
module.exports.NODE_ENV = config.get('NODE_ENV', 'development');
module.exports.BASE_URL = config.get('BASE_URL');

// oauth
module.exports.OAUTH2_CLIENT_ID = config.get('OAUTH2_CLIENT_ID');
module.exports.OAUTH2_CLIENT_SECRET = config.get('OAUTH2_CLIENT_SECRET');

// s3
module.exports.S3_BUCKET_NAME = config.get('S3_BUCKET_NAME');
module.exports.S3_BUCKET_REGION = config.get('S3_BUCKET_REGION');
module.exports.S3_USER_ACCESS_KEY_ID = config.get('S3_USER_ACCESS_KEY_ID');
module.exports.S3_USER_SECRET_ACCESS_KEY = config.get('S3_USER_SECRET_ACCESS_KEY');
