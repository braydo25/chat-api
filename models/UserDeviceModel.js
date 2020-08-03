const aws = require('aws-sdk');
const awsConfig = rootRequire('/config/aws');

/*
 * Model Definition
 */

const UserDeviceModel = database.define('userDevice', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  idfv: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  details: {
    type: Sequelize.JSON,
    allowNull: false,
  },
  apnsSnsArn: {
    type: Sequelize.STRING,
  },
  apnsToken: {
    type: Sequelize.STRING,
    unique: true,
  },
  fcmSnsArn: {
    type: Sequelize.STRING,
  },
  fcmRegistrationId: {
    type: Sequelize.STRING,
    unique: true,
  },
});

/*
 * Instance Hooks
 */

UserDeviceModel.beforeCreate(setPlatformArn);
UserDeviceModel.beforeUpdate(setPlatformArn);

function setPlatformArn(instance) {
  const sns = new aws.SNS();

  if (instance.apnsToken) {
    return sns.createPlatformEndpoint({
      Token: instance.apnsToken,
      PlatformApplicationArn: awsConfig.snsApnsPlatformApplicationArn,
    }).promise().then(result => {
      instance.apnsSnsArn = result.EndpointArn;
    });
  }

  if (instance.fcmRegistrationId) {
    return sns.createPlatformEndpoint({
      Token: instance.fcmRegistrationId,
      PlatformApplicationArn: awsConfig.snsFcmPlatformApplicationArn,
    }).promise().then(result => {
      instance.fcmSnsArn = result.EndpointArn;
    });
  }
}

/*
 * Class Methods
 */

UserDeviceModel.sendPushNotificationForUserId = function({ userId, title, message, data }) {
  UserDeviceModel.findAll({ where: { userId } }).then(userDevices => {
    userDevices.forEach(userDevice => {
      userDevice.sendPushNotification({ title, message, data });
    });
  });
};

/*
 * Instance Methods
 */

UserDeviceModel.prototype.sendPushNotification = function({ title, message, data }) {
  const sns = new aws.SNS();

  if (this.apnsSnsArn) {
    const apnsPayload = JSON.stringify({
      aps: {
        alert: { title, body: message },
        badge: 1,
        sound: 'default',
      },
      data,
    });

    sns.publish({
      Message: JSON.stringify({
        default: message,
        APNS: apnsPayload,
        APNS_SANDBOX: apnsPayload,
      }),
      TargetArn: this.apnsSnsArn,
      MessageStructure: 'json',
    }).promise().catch(err => { /* noop */ });
  }

  if (this.fcmSnsArn) {
    sns.publish({
      Message: JSON.stringify({
        default: message,
        GCM: JSON.stringify({
          data: { title, message, data },
        }),
      }),
      TargetArn: this.fcmSnsArn,
      MessageStructure: 'json',
    }).promise().catch(err => { /* noop */});
  }
};

/*
 * Export
 */

module.exports = UserDeviceModel;
