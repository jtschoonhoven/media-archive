const crypto = require('crypto');

const settings = require('../settings');

/*
 * Adapted from https://leonid.shevtsov.me/post/demystifying-s3-browser-upload/
 * Requires S3 CORS policy to allow requests from domain. Example policy:
 *
 * <?xml version="1.0" encoding="UTF-8"?>
 * <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
 *   <CORSRule>
 *     <AllowedOrigin>https://yourdomain.biz</AllowedOrigin>
 *     <AllowedMethod>HEAD</AllowedMethod>
 *     <AllowedMethod>GET</AllowedMethod>
 *     <AllowedMethod>POST</AllowedMethod>
 *     <AllowedHeader>*</AllowedHeader>
 *     <ExposeHeader>ETag</ExposeHeader>
 *   </CORSRule>
 * </CORSConfiguration>
 */

const S3_BUCKET_NAME = settings.S3_BUCKET_NAME;
const S3_BUCKET_REGION = settings.S3_BUCKET_REGION;
const S3_USER_ACCESS_KEY_ID = settings.S3_USER_ACCESS_KEY_ID;
const S3_USER_SECRET_ACCESS_KEY = settings.S3_USER_SECRET_ACCESS_KEY;

/*
 * Generate a date string, specially-formatted for the AWS API.
 */
function getAwsDateString() {
    const date = new Date().toISOString();
    return `${date.substr(0, 4)}${date.substr(5, 2)}${date.substr(8, 2)}`;
}

/*
 * Encrypt the given string with the given signing key.
 */
function hmac(key, string) {
    const sha = crypto.createHmac('sha256', key);
    sha.end(string);
    return sha.read();
}

/*
 * Generate a credential string for the user in the format expected by AWS.
 */
function getS3Credentials() {
    return [
        S3_USER_ACCESS_KEY_ID,
        getAwsDateString(),
        S3_BUCKET_REGION,
        's3/aws4_request',
    ].join('/');
}

/*
 * Configure rules for file upload.
 * See See https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html.
 */
function getS3UploadPolicy(filepath, credential) {
    return {
        // 5 minutes into the future
        expiration: new Date((new Date()).getTime() + (5 * 60 * 1000)).toISOString(),
        conditions: [
            { bucket: S3_BUCKET_NAME },
            { key: filepath },
            { acl: 'public-read' },
            { success_action_status: '201' },
            // Optionally control content type and file size
            // {'Content-Type': 'application/pdf'},
            // ['content-length-range', 0, 1000000],
            { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
            { 'x-amz-credential': credential },
            { 'x-amz-date': `${getAwsDateString()}T000000Z` },
        ],
    };
}

/*
 * Sign the policy with the authorized users' secret key to prevent tampering.
 */
function getS3UploadPolicySignature(policy) {
    const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64');
    const dateKey = hmac(`AWS4 ${S3_USER_SECRET_ACCESS_KEY}`, getAwsDateString());
    const dateRegionKey = hmac(dateKey, S3_BUCKET_REGION);
    const dateRegionServiceKey = hmac(dateRegionKey, 's3');
    const signingKey = hmac(dateRegionServiceKey, 'aws4_request');
    return hmac(signingKey, policyBase64).toString('hex');
}

/*
 * Get all authorization config needed by the client to POST directly to S3.
 */
module.exports.getS3UploadAuth = (s3FilePath) => {
    const credentials = getS3Credentials();
    const policy = getS3UploadPolicy(s3FilePath, credentials);
    return {
        'key': s3FilePath,
        'acl': 'public-read',
        'successActionStatus': '201',
        'policy': 'policyBase64',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': credentials,
        'x-amz-date': `${getAwsDateString()}T000000Z`,
        'x-amz-signature': getS3UploadPolicySignature(policy),
    };
};
