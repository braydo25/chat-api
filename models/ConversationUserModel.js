const ConversationModel = rootRequire('/models/ConversationModel');
const UserModel = rootRequire('/models/UserModel');

const permissions = [
  'CONVERSATION_ADMIN',
  'CONVERSATION_MESSAGES_CREATE',
  'CONVERSATION_MESSAGES_READ',
//  'CONVERSATION_MESSAGES_UPDATE', not in use
//  'CONVERSATION_MESSAGES_DELETE', not in use
  'CONVERSATION_MESSAGE_REACTIONS_CREATE',
  'CONVERSATION_MESSAGE_REACTIONS_READ',
//  'CONVERSATION_MESSAGE_REACTIONS_UPDATE', not in use
//  'CONVERSATION_MESSAGE_REACTIONS_DELETE', not in use
  'CONVERSATION_USERS_CREATE',
  'CONVERSATION_USERS_READ',
  'CONVERSATION_USERS_UPDATE',
  'CONVERSATION_USERS_DELETE',
];

/*
 * Model Definition
 */

const ConversationUserModel = database.define('conversationUser', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  conversationId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  permissions: {
    type: Sequelize.JSON,
    allowNull: false,
    validate: {
      isValid(value) {
        value.forEach(permission => {
          if (!permissions.includes(permission)) {
            throw new Error('Invalid conversation user permission provided');
          }
        });
      },
    },
    defaultValue: [],
  },
  lastActiveAt: {
    type: Sequelize.DATE,
  },
}, {
  defaultScope: {
    attributes: [ 'id', 'permissions' ],
    include: [ UserModel ],
  },
  scopes: {
    complete: {
      include: [ UserModel ],
    },
  },
});

/*
 * Hooks
 */

ConversationUserModel.addHook('afterCreate', conversationUser => {
  ConversationModel.update({ usersCount: database.literal('usersCount + 1') }, {
    where: { id: conversationUser.conversationId },
  });
});

ConversationUserModel.addHook('afterDestroy', conversationUser => {
  ConversationModel.update({ usersCount: database.literal('usersCount - 1') }, {
    where: { id: conversationUser.conversationId },
  });
});

/*
 * Export
 */

module.exports = ConversationUserModel;
