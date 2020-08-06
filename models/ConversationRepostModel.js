const ConversationModel = rootRequire('/models/ConversationModel');
const UserModel = rootRequire('/models/UserModel');
const events = rootRequire('/libs/events');

/*
 * Model Defitinion
 */

const ConversationRepostModel = database.define('conversationRepost', {
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
}, {
  scopes: {
    complete: authUserId => ({
      attributes: [ 'id' ],
      include: [
        {
          model: ConversationModel.scope({ method: [ 'preview', authUserId ] }),
          required: true,
        },
        UserModel,
      ],
    }),
    activityPreview: () => ({
      attributes: [
        'id',
        'createdAt',
      ],
      include: [
        {
          model: ConversationModel.scope('activityPreview'),
          required: true,
        },
        UserModel,
      ],
    }),
  },
});

/*
 * Hooks
 */

ConversationRepostModel.addHook('afterCreate', (conversationRepost, options) => {
  conversationRepost.publishEvent({ type: 'create', options });
});

ConversationRepostModel.addHook('afterDestroy', (conversationRepost, options) => {
  conversationRepost.publishEvent({ type: 'delete', options });
});

/*
 * Class Methods
 */

ConversationRepostModel.findAllNormalized = async function({ authUserId, options }) {
  // TODO: it would be better if we could factor this into the ConversationModel
  // complete scope somehow for just a singular conversations query to include
  // reposts as well..?

  const conversationReposts = await ConversationRepostModel.scope({
    method: [ 'complete', authUserId ],
  }).findAll(options);

  return conversationReposts.map(conversationRepost => ({
    ...conversationRepost.toJSON().conversation,
    conversationRepostId: conversationRepost.id,
    conversationRepostUser: conversationRepost.user,
  }));
};

/*
 * Events
 */

ConversationRepostModel.prototype.publishEvent = async function({ type, options }) {
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

ConversationRepostModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_REPOST_CREATE',
    data: this,
  });
};

ConversationRepostModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_REPOST_DELETE',
    data: {
      id: this.id,
      conversationId: this.conversationId,
    },
  });
};

/*
 * Export
 */

module.exports = ConversationRepostModel;
