const aws = require('aws-sdk');
const config = require('config');

const filesService = require('./files');

const S3_PROTOCOL_PREFIX = 's3://';
const PUT_OBJECT_EXPIRATION_SECONDS = 60 * 60 * 6; // 6 hours
const GET_OBJECT_EXPIRATION_SECONDS = 60 * 60 * 24 * 3; // 3 days

const NODE_ENV = config.get('NODE_ENV');
const FILE_EXT_WHITELIST = config.get('CONSTANTS.FILE_EXT_WHITELIST');
const S3_BUCKET_NAME = config.get('S3_BUCKET_NAME');
const S3_BUCKET_REGION = config.get('S3_BUCKET_REGION');

const S3_CONFIG = { region: S3_BUCKET_REGION };

/*
 * In production the credentials are automatically available through an IAM role.
 * However, in developmment we must create a user with access to the bucket.
 * For security reasons, there should be separate buckets for dev and prod.
 */
if (NODE_ENV === 'development') {
    S3_CONFIG.accessKeyId = config.get('S3_DEV_USER_ACCESS_KEY_ID');
    S3_CONFIG.secretAccessKey = config.get('S3_DEV_USER_SECRET_ACCESS_KEY');
}
const S3 = new aws.S3(S3_CONFIG);

/*
 * The bucket MUST have a CORS policy to allow requests from your domain.
 * Example policy:
 *
 * <?xml version="1.0" encoding="UTF-8"?>
 * <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
 *     <CORSRule>
 *         <AllowedOrigin>https://www.yourdomain.biz</AllowedOrigin>
 *         <AllowedMethod>HEAD</AllowedMethod>
 *         <AllowedMethod>GET</AllowedMethod>
 *         <AllowedMethod>POST</AllowedMethod>
 *         <AllowedHeader>*</AllowedHeader>
 *         <ExposeHeader>ETag</ExposeHeader>
 *     </CORSRule>
 * </CORSConfiguration>
 */

/*
 * The EC2 instance (or user) MUST be assigned a role with proper access to the S3 bucket.
 * Example policy:
 *
 * {
 *     "Version": "2012-10-17",
 *     "Statement": [
 *         {
 *             "Sid": "putObjectStatement",
 *             "Effect": "Allow",
 *             "Action": "s3:PutObject",
 *             "Resource": "arn:aws:s3:::media-archive-uploads-development/*"
 *         },
 *         {
 *             "Sid": "getObjectStatement",
 *             "Effect": "Allow",
 *             "Action": "s3:GetObject",
 *             "Resource": "arn:aws:s3:::media-archive-uploads-development/*"
 *         }
 *     ]
 * }
 */

/*
 * And the bucket must have public access:
 *
 * FIXME: this isn't ideal, but is needed so we can use Google Drive viewer to display
 * certain file types. Better would be to use an internal library to display docs.
 *
 *  {
 *   "Id": "Policy1546503344536",
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Sid": "Stmt1546503337001",
 *       "Action": [
 *         "s3:GetObject"
 *       ],
 *       "Effect": "Allow",
 *       "Resource": "arn:aws:s3:::media-archive-uploads-development/*",
 *       "Principal": "*"
 *     }
 *   ]
 * }
 */


/*
 * Generate the s3 key for an object.
 */
function generateS3Key(uuid, extension) {
    return `${uuid}.${extension.toLowerCase()}`;
}

/*
 * Parse an s3 URL (one that starts with s3://) to get the bucket and key names.
 */
function parseS3Url(url) {
    const [bucket, ...keyFragments] = url.replace(S3_PROTOCOL_PREFIX, '').split('/');
    return { bucket, key: keyFragments.join('/') };
}

/*
 * Generate a (unsigned) URL for an object on S3.
 * Cannot be linked to directly, must be signed (see methods below).
 */
module.exports.getS3Url = (uuid, extension) => {
    const s3Key = generateS3Key(uuid, extension);
    return `${S3_PROTOCOL_PREFIX}${S3_BUCKET_NAME}/${s3Key}`;
};

/*
 * Helper method to distinguish between S3 and HTTP URLs.
 */
module.exports.isS3Url = (url) => {
    return !!url && url.startsWith('s3://');
};

/*
 * Generate the policy and form fields required by the client for direct upload to S3.
 */
module.exports.getPresignedPost = async (s3Url, filename) => {
    const { bucket, key } = parseS3Url(s3Url);
    const extension = filesService.getFileExtension(filename);
    const s3Params = {
        Expires: PUT_OBJECT_EXPIRATION_SECONDS,
        Bucket: bucket,
        Conditions: [{ key }],
        Fields: {
            'key': key,
            'Content-Type': FILE_EXT_WHITELIST[extension].mimeType,
            'Content-Disposition': filesService.getSanitizedFileName(filename),
            'success_action_status': '201',
        },
    };
    return new Promise((resolve, reject) => {
        S3.createPresignedPost(s3Params, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

/*
 * Generate a signed URL that can be used to retrieve an object from S3.
 */
module.exports.getPresignedUrl = async (s3Url) => {
    const { bucket, key } = parseS3Url(s3Url);
    const params = {
        Bucket: bucket,
        Key: key,
        Expires: GET_OBJECT_EXPIRATION_SECONDS,
    };
    return new Promise((resolve, reject) => {
        S3.getSignedUrl('getObject', params, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

/**
 * Return a ReadableStream for the given S3 object.
 */
module.exports.streamObject = (s3Url) => {
    const { bucket, key } = parseS3Url(s3Url);
    const params = { Bucket: bucket, Key: key };
    return S3.getObject(params).createReadStream();
    // Note: alternatively we could have returned the file contents like this:
    // return new Promise((resolve, reject) => {
    //     stream.on('data', (chunk) => {
    //         fileContent += chunk;
    //     });
    //     stream.on('end', () => {
    //         resolve(fileContent);
    //     });
    //     stream.on('error', (err) => {
    //         reject(err);
    //     });
    // });
};
