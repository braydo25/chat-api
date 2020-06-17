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
  lastActiveAt: {
    type: Sequelize.DATE,
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
    noAvatar: {
      attributes: [
        'id',
        'username',
        'name',
      ],
    },
    complete: {
      include: [
        {
          model: AttachmentModel.scope('avatar'),
          as: 'avatarAttachment',
        },
      ],
    },
  },
});

/*
 * Instance Methods
 */

UserModel.prototype.updateAndSendPhoneLoginCode = async function() {
  this.phoneLoginCode = (process.env.NODE_ENV !== 'local') ? Math.floor(Math.random() * 900000) + 100000 : '000000';

  if (process.env.NODE_ENV !== 'local') {
    await awsHelpers.sendTextMessage({
      phoneNumber: this.phone,
      message: `Hey, this is Babble! Your one-time passcode is: ${this.phoneLoginCode}`,
    });
  }

  await this.save();
};

/*
 * Export
 */

module.exports = UserModel;
