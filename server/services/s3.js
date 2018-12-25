const aws = require('aws-sdk');
const config = require('config');

const SIGNATURE_EXPIRATION_SECONDS = 60 * 60 * 6; // 6 hours

const FILE_EXT_WHITELIST = config.get('CONSTANTS.FILE_EXT_WHITELIST');
const S3_BUCKET_NAME = config.get('S3_BUCKET_NAME');
const S3_BUCKET_REGION = config.get('S3_BUCKET_REGION');
const S3_USER_ACCESS_KEY_ID = config.get('S3_USER_ACCESS_KEY_ID');
const S3_USER_SECRET_ACCESS_KEY = config.get('S3_USER_SECRET_ACCESS_KEY');

const S3 = new aws.S3({
    region: S3_BUCKET_REGION,
    accessKeyId: S3_USER_ACCESS_KEY_ID,
    secretAccessKey: S3_USER_SECRET_ACCESS_KEY,
});

/*
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


/*
 * Generate the policy and form fields required by the client for direct upload to S3.
 */
module.exports.getPresignedPost = (uuid, fileName, fileExt) => {
    const s3Key = `${uuid}.${fileExt.toLowerCase()}`;
    const contentType = FILE_EXT_WHITELIST[fileExt.toUpperCase()].mimeType;
    const s3Params = {
        Expires: SIGNATURE_EXPIRATION_SECONDS,
        Bucket: S3_BUCKET_NAME,
        Conditions: [
            { key: s3Key },
        ],
        Fields: {
            'key': s3Key,
            'Content-Type': contentType,
            'Content-Disposition': fileName,
            'success_action_status': '201',
            'acl': 'public-read',
        },
    };
    return S3.createPresignedPost(s3Params);
};
