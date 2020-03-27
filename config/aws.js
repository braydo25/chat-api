/*
 * Core
 */

module.exports.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
module.exports.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
module.exports.region = process.env.AWS_REGION;

/*
 * S3
 */

module.exports.s3FileUploadsBucket = process.env.AWS_S3_FILE_UPLOADS_BUCKET;
