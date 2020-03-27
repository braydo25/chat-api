const aws = require('aws-sdk');
const awsConfig = rootRequire('/config/aws');

/*
 * S3
 */

async function uploadFileToS3(buffer, filename) {
  const s3 = new aws.S3();
  const keyPrefix = Math.random().toString(32).substring(2, 15);
  const result = await s3.upload({
    ACL: 'public-read',
    Body: buffer,
    Bucket: awsConfig.s3FileUploadsBucket,
    Key: `${keyPrefix}/${filename}`,
  }).promise();

  return result.Location;
}

/*
 * SNS
 */

async function sendTextMessage({ phoneNumber, message }) {
  const sns = new aws.SNS();

  phoneNumber = (phoneNumber[0] !== '+') ? `+${phoneNumber}` : phoneNumber;

  return sns.publish({
    PhoneNumber: phoneNumber,
    Message: message,
  }).promise();
}

/*
 * Cloudwatch
 */

function logEvent({ event, data }) {
  console.log(JSON.stringify({
    event,
    ...data,
  }));
}



/*
 * Export
 */

module.exports = {
  uploadFileToS3,
  sendTextMessage,
  logEvent,
};
