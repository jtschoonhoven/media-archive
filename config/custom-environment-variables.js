module.exports = {
    // app
    'BASE_URL': 'BASE_URL',
    'NODE_ENV': 'development',

    // oauth
    'OAUTH2_CLIENT_ID': 'OAUTH2_CLIENT_ID',
    'OAUTH2_CLIENT_SECRET': 'OAUTH2_CLIENT_SECRET',

    // postgres
    'RDS_DB_NAME': 'RDS_DB_NAME',
    'RDS_HOSTNAME': 'RDS_HOSTNAME',
    'RDS_PASSWORD': 'RDS_PASSWORD',
    'RDS_PORT': 'RDS_PORT',
    'RDS_USERNAME': 'RDS_USERNAME',

    // s3 bucket
    'S3_BUCKET_NAME': 'S3_BUCKET_NAME',
    'S3_BUCKET_REGION': 'S3_BUCKET_REGION',

    // s3 user
    // FIXME: use role-based permissions in production
    'S3_DEV_USER_ACCESS_KEY_ID': 'S3_DEV_USER_ACCESS_KEY_ID',
    'S3_DEV_USER_SECRET_ACCESS_KEY': 'S3_DEV_USER_SECRET_ACCESS_KEY',

    // secret
    'SESSION_SECRET': 'SESSION_SECRET',
};
