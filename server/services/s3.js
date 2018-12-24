const AWS = require('aws-sdk');
const crypto = require('crypto');

/*
 * Adapted from https://leonid.shevtsov.me/post/demystifying-s3-browser-upload/
 */

const BUCKET_NAME = 'media-archive-uploads';

// generate and format an ISO date string as expected by the AWS APIs
function dateString() {
    const date = new Date().toISOString();
    return `${date.substr(0, 4)}${date.substr(5, 2)}${date.substr(8, 2)}`;
}

function hmac(key, string) {
    const sha = crypto.createHmac('sha256', key);
    sha.end(string);
    return sha.read();
}

function amzCredential(config) {
    return [config.accessKey, dateString(), config.region, 's3/aws4_request'].join('/');
}

// Constructs the policy
function s3UploadPolicy(config, filepath, credential) {
    return {
        // 5 minutes into the future
        expiration: new Date((new Date()).getTime() + (5 * 60 * 1000)).toISOString(),
        conditions: [
            { bucket: config.bucket },
            { key: filepath },
            { acl: 'public-read' },
            { success_action_status: '201' },
            // Optionally control content type and file size
            // {'Content-Type': 'application/pdf'},
            // ['content-length-range', 0, 1000000],
            { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
            { 'x-amz-credential': credential },
            { 'x-amz-date': `${dateString()}T000000Z` },
        ],
    };
}

// Signs the policy with the credential
function s3UploadSignature(config, policyBase64, credential) {
    const dateKey = hmac(`AWS4 ${config.secretKey}`, dateString());
    const dateRegionKey = hmac(dateKey, config.region);
    const dateRegionServiceKey = hmac(dateRegionKey, 's3');
    const signingKey = hmac(dateRegionServiceKey, 'aws4_request');
    return hmac(signingKey, policyBase64).toString('hex');
}

function s3Params(config, filepath) {
    const credential = amzCredential(config);
    const policy = s3UploadPolicy(config, filepath, credential);
    const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64');
    return {
        'key': filepath,
        'acl': 'public-read',
        'successActionStatus': '201',
        'policy': 'policyBase64',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': credential,
        'x-amz-date': `${dateString()}T000000Z`,
        'x-amz-signature': s3UploadSignature(config, policyBase64, credential),
    };
}

// return a policy that may be used to upload a single file
module.exports.getPolicy = (config, filepath) => {
    return {
        endpointUrl: `https://${BUCKET_NAME}.s3.amazonaws.com`,
        params: s3Params(config, filepath),
    };
};
