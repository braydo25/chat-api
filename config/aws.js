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

/*
 * IOT
 */

module.exports.iotEndpoint = process.env.AWS_IOT_ENDPOINT;

/*
 * SNS
 */

module.exports.snsFcmPlatformApplicationArn = process.env.AWS_SNS_FCM_PLATFORM_APPLICATION_ARN;
module.exports.snsApnsPlatformApplicationArn = process.env.AWS_SNS_APNS_PLATFORM_APPLICATION_ARN;
module.exports.snsSmsTestNumbers = process.env.AWS_SNS_SMS_TEST_NUMBERS.split(',');
