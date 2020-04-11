const UserModel = rootRequire('/models/UserModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');

const accessLevels = [ 'public', 'protected', 'private' ];

/*
 * Model Definition
 */

const ConversationModel = database.define('conversation', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  accessLevel: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [ accessLevels ],
        msg: 'The access level provided is invalid.',
      },
    },
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'accessLevel',
      'createdAt',
    ],
  },
  scopes: {
    complete: {
      attributes: [
        'id',
        'accessLevel',
        'createdAt',
      ],
      include: [
        ConversationMessageModel,
        ConversationUserModel,
        UserModel,
      ],
    },
  },
});

/*
 * Class Methods
 */

ConversationModel.createWithAssociations = async function({ data, userIds = [], transaction }) {
  userIds = [ ...new Set([ data.userId, ...userIds ]) ];

  const conversation = await ConversationModel.create(data, { transaction });
  const conversationUsers = await ConversationUserModel.bulkCreate((
    userIds.map(userId => ({ conversationId: conversation.id, userId }))
  ), { transaction });
  const users = await UserModel.findAll({
    where: { id: userIds },
  }, { transaction });

  conversation.setDataValue('user', users.find(user => user.id === data.userId));
  conversation.setDataValue('conversationUsers', conversationUsers);

  conversationUsers.forEach(conversationUser => {
    conversationUser.setDataValue('user', users.find(user => {
      return conversationUser.userId === user.id;
    }));
  });

  return conversation;
};

/*
 * Export
 */

module.exports = ConversationModel;
