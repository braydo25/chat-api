const events = rootRequire('/libs/events');

/*
 * Model Definition
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');

const ConversationMessageModel = database.define('conversationMessage', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  conversationUserId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  nonce: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  text: {
    type: Sequelize.TEXT,
    set(text) {
      if (text) {
        this.setDataValue('text', text.trim());
      }
    },
  },
  pinnedAt: {
    type: Sequelize.DATE(4),
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'conversationId',
      'text',
      'createdAt',
      'updatedAt',
    ],
    include: [
      AttachmentModel,
      ConversationUserModel,
      EmbedModel,
    ],
  },
  scopes: {
    withReactions: () => ({
      include: [
        {
          attributes: [
            'reaction',
            [ database.fn('COUNT', 'id'), 'count' ],
          ],
          model: ConversationMessageReactionModel.unscoped(),
          separate: true,
          group: [ 'conversationMessageId', 'reaction' ],
        },
      ],
    }),
    withAuthUserReactions: userId => ({
      include: [
        {
          attributes: [
            'id',
            'reaction',
          ],
          model: ConversationMessageReactionModel.unscoped(),
          as: 'authUserConversationMessageReactions',
          where: { userId },
          required: false,
        },
      ],
    }),
  },
});

/*
 * Hooks
 */

ConversationMessageModel.addHook('afterCreate', (conversationMessage, options) => {
  conversationMessage.publishEvent({ type: 'create', options });
});

ConversationMessageModel.addHook('afterUpdate', (conversationMessage, options) => {
  conversationMessage.publishEvent({ type: 'update', options });
});

ConversationMessageModel.addHook('afterDestroy', (conversationMessage, options) => {
  conversationMessage.publishEvent({ type: 'delete', options });
});

/*
 * Class Methods
 */

ConversationMessageModel.createWithAssociations = async function({ data, conversationUser, attachmentIds = [], embedIds = [], eventsTopic, transaction }) {
  const ConversationMessageAttachmentModel = database.models.conversationMessageAttachment;
  const ConversationMessageEmbedModel = database.models.conversationMessageEmbed;

  attachmentIds = [ ...new Set(attachmentIds) ];
  embedIds = [ ...new Set(embedIds) ];

  if (!data.text && !attachmentIds.length && !embedIds.length) {
    throw new Error('You must provide text, an attachment, or embed.');
  }

  const attachments = await AttachmentModel.findAll({
    where: { id: attachmentIds },
  }, { transaction });

  const embeds = await EmbedModel.findAll({
    where: { id: embedIds },
  }, { transaction });

  const conversationMessage = await ConversationMessageModel.create(data, {
    eventsTopic,
    transaction,
    setDataValues: { attachments, embeds, conversationUser },
  });

  await ConversationMessageAttachmentModel.bulkCreate((
    attachmentIds.map(attachmentId => ({ conversationMessageId: conversationMessage.id, attachmentId }))
  ), { transaction });

  await ConversationMessageEmbedModel.bulkCreate((
    embedIds.map(embedId => ({ conversationMessageId: conversationMessage.id, embedId }))
  ), { transaction });

  return conversationMessage;
};

/*
 * Events
 */

ConversationMessageModel.prototype.publishEvent = async function({ type, options }) {
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

ConversationMessageModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_MESSAGE_CREATE',
    data: this,
  });
};

ConversationMessageModel.prototype._publishUpdateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_MESSAGE_UPDATE',
    data: this,
  });
};

ConversationMessageModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'CONVERSATION_MESSAGE_DELETE',
    data: {
      id: this.id,
      conversationId: this.conversationId,
    },
  });
};

/*
 * Export
 */

module.exports = ConversationMessageModel;
