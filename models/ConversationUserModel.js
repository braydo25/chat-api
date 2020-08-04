const UserModel = rootRequire('/models/UserModel');
const events = rootRequire('/libs/events');

const permissions = [
  'CONVERSATION_ADMIN',
  'CONVERSATION_MESSAGES_CREATE',
  'CONVERSATION_MESSAGES_READ',
//  'CONVERSATION_MESSAGES_UPDATE', not in use
//  'CONVERSATION_MESSAGES_DELETE', not in use
  'CONVERSATION_MESSAGE_PINS_CREATE',
  'CONVERSATION_MESSAGE_PINS_DELETE',
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
}, {
  defaultScope: {
    attributes: [ 'id', 'userId', 'conversationId', 'permissions' ],
    include: [ UserModel ],
  },
  scopes: {
    preview: () => ({
      attributes: [ 'id', 'permissions' ],
    }),
  },
});

/*
 * Hooks
 */

ConversationUserModel.addHook('afterCreate', async (conversationUser, options) => {
  const ConversationModel = database.models.conversation;

  await ConversationModel.update({ usersCount: database.literal('usersCount + 1') }, {
    where: { id: conversationUser.conversationId },
    transaction: options.transaction,
  });

  conversationUser.publishEvent({ type: 'create', options });
});

ConversationUserModel.addHook('afterUpdate', async (conversationUser, options) => {
  conversationUser.publishEvent({ type: 'update', options });
});

ConversationUserModel.addHook('afterDestroy', async (conversationUser, options) => {
  const ConversationModel = database.models.conversation;

  await ConversationModel.update({ usersCount: database.literal('usersCount - 1') }, {
    where: { id: conversationUser.conversationId },
    transaction: options.transaction,
  });

  conversationUser.publishEvent({ type: 'delete', options });
});

/*
 * Events
 */

ConversationUserModel.prototype.publishEvent = async function ({ type, options }) {
  const { eventsTopic, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(eventsTopic) : eventMethod;
  eventMethod = (type === 'update') ? () => this._publishUpdateEvent(eventsTopic) : eventMethod;
  eventMethod = (type === 'delete') ? () => this._publishDeleteEvent(eventsTopic) : eventMethod;

  if (eventMethod && eventsTopic) {
    if (transaction) {
      transaction.afterCommit(() => eventMethod());
    } else {
      eventMethod();
    }
  }
};

ConversationUserModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_USER_CREATE',
    data: this,
  });
};

ConversationUserModel.prototype._publishUpdateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_USER_UPDATE',
    data: this,
  });
};

ConversationUserModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_USER_DELETE',
    data: {
      id: this.id,
      conversationId: this.conversationId,
    },
  });
};

/*
 * Export
 */

module.exports = ConversationUserModel;
