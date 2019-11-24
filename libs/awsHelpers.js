const aws = require('aws-sdk');

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
  logEvent,
};
