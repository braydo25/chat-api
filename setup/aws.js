const aws = require('aws-sdk');
const awsConfig = rootRequire('/config/aws');

aws.config = new aws.Config({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
});
