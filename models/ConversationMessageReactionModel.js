const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const events = rootRequire('/libs/events');

/*
 * Model Definition
 */

const ConversationMessageReactionModel = database.define('conversationMessageReaction', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  conversationUserId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  reaction: {
    type: Sequelize.STRING(3),
    allowNull: false,
    validate: {
      len: {
        args: [ 1, 3 ],
        msg: 'Reaction cannot be more than 3 characters.',
      },
    },
  },
}, {
  collate: 'utf8mb4_bin',
  defaultScope: {
    attributes: [
      'id',
      'conversationMessageId',
      'conversationUserId',
      'reaction',
      'createdAt',
    ],
    include: [ ConversationUserModel ],
  },
  indexes: [
    {
      fields: [ 'reaction' ],
      unique: false,
    },
  ],
});

/*
 * Hooks
 */

ConversationMessageReactionModel.addHook('afterCreate', (conversationMessageReaction, options) => {
  conversationMessageReaction.publishEvent({ type: 'create', options });
});

ConversationMessageReactionModel.addHook('afterDestroy', (conversationMessageReaction, options) => {
  conversationMessageReaction.publishEvent({ type: 'delete', options });
});

/*
 * Events
 */

ConversationMessageReactionModel.prototype.publishEvent = async function({ type, options }) {
  const { eventsTopic, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(eventsTopic) : eventMethod;
  eventMethod = (type === 'delete') ? () => this._publishDeleteEvent(eventsTopic) : eventMethod;

  if (eventMethod && eventsTopic) {
    if (transaction) {
      transaction.afterCommit(() => eventMethod());
    } else {
      eventMethod();
    }
  }
};

ConversationMessageReactionModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_MESSAGE_REACTION_CREATE',
    data: this,
  });
};

ConversationMessageReactionModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_MESSAGE_REACTION_DELETE',
    data: this,
  });
};

/*
 * Export
 */

module.exports = ConversationMessageReactionModel;
