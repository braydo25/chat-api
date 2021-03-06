const { v4: uuidV4 }  = require('uuid');
const AttachmentModel = rootRequire('/models/AttachmentModel');
const awsHelpers = rootRequire('/libs/awsHelpers');

/*
 * Model Definition
 */

const UserModel = database.define('user', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  accessToken: {
    type: Sequelize.UUID,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
  },
  eventsTopic: {
    type: Sequelize.STRING,
    unique: true,
    defaultValue: () => {
      return `user-${uuidV4()}`;
    },
  },
  avatarAttachmentId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
  username: {
    type: Sequelize.STRING,
    unique: {
      msg: 'The username you provided is taken.',
    },
  },
  phone: {
    type: Sequelize.STRING,
    unique: {
      msg: 'The phone number you provided is already in use.',
    },
    validate: {
      isPhone: value => {
        if (!(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value))) {
          throw new Error('The phone number you provided is invalid.');
        }
      },
    },
  },
  phoneLoginCode: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  about: {
    type: Sequelize.STRING,
  },
  followersCount: {
    type: Sequelize.INTEGER(10),
    defaultValue: 0,
  },
  lastActiveAt: {
    type: Sequelize.DATE(4),
    defaultValue: Sequelize.NOW,
  },
  lastViewedActivityAt: {
    type: Sequelize.DATE(4),
    defaultValue: Sequelize.NOW,
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'username',
      'name',
      'lastActiveAt',
    ],
    include: [
      {
        model: AttachmentModel.scope('avatar'),
        as: 'avatarAttachment',
      },
    ],
  },
  scopes: {
    noAvatar: () => ({
      attributes: [
        'id',
        'username',
        'name',
      ],
    }),
    complete: () => ({
      attributes: [
        'id',
        'username',
        'name',
        'about',
        'followersCount',
        'lastActiveAt',
      ],
      include: [
        {
          model: AttachmentModel.scope('avatar'),
          as: 'avatarAttachment',
        },
      ],
    }),
    login: () => ({
      include: [
        {
          model: AttachmentModel.scope('avatar'),
          as: 'avatarAttachment',
        },
      ],
    }),
  },
});

/*
 * Hooks
 */

UserModel.addHook('afterCreate', (user, options) => {
  const UserFollowerModel = database.models.userFollower;

  return UserFollowerModel.create({
    userId: 1, // Babble account
    followerUserId: user.id,
  }, {
    transaction: options.transaction,
  });
});

/*
 * Class Methods
 */

UserModel.createWithInvite = async function ({ name, phone, inviteMessage }) {
  const user = await UserModel.create({ name, phone });

  awsHelpers.sendTextMessage({
    phoneNumber: phone,
    message: inviteMessage,
  });

  return user;
};

UserModel.getEventsTopic = async function(userId) {
  const user = await UserModel.findOne({
    attributes: [ 'eventsTopic' ],
    where: { id: userId },
  });

  return user.eventsTopic;
};

/*
 * Instance Methods
 */

UserModel.prototype.updateAndSendPhoneLoginCode = async function() {
  const phoneLoginCode = (process.env.NODE_ENV !== 'local') ? Math.floor(Math.random() * 900000) + 100000 : '000000';

  await awsHelpers.sendTextMessage({
    phoneNumber: this.phone,
    message: `${phoneLoginCode} is your one-time Babble passcode.`,
  });

  await this.update({ phoneLoginCode });
};

UserModel.prototype.sendInviteTextMessage = async function(message) {
  awsHelpers.sendTextMessage({
    phoneNumber: this.phone,
    message,
  });
};

/*
 * Export
 */

module.exports = UserModel;
