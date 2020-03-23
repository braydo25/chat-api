const aws = require('aws-sdk');

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
  sendTextMessage,
  logEvent,
};
