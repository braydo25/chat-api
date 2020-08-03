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
    type: Sequelize.DATE,
  },
}, {
  defaultScope: {
    attributes: [
      'id',
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
 * Class Methods
 */

ConversationMessageModel.createWithAssociations = async function({ data, conversationUser, attachmentIds = [], embedIds = [], transaction }) {
  const ConversationMessageAttachmentModel = database.models.conversationMessageAttachment;
  const ConversationMessageEmbedModel = database.models.conversationMessageEmbed;

  attachmentIds = [ ...new Set(attachmentIds) ];
  embedIds = [ ...new Set(embedIds) ];

  if (!data.text && !attachmentIds.length && !embedIds.length) {
    throw new Error('You must provide text, an attachment, or embed.');
  }

  const conversationMessage = await ConversationMessageModel.create(data, { transaction });

  await ConversationMessageAttachmentModel.bulkCreate((
    attachmentIds.map(attachmentId => ({ conversationMessageId: conversationMessage.id, attachmentId }))
  ), { transaction });

  await ConversationMessageEmbedModel.bulkCreate((
    embedIds.map(embedId => ({ conversationMessageId: conversationMessage.id, embedId }))
  ), { transaction });

  const attachments = await AttachmentModel.findAll({
    where: { id: attachmentIds },
  }, { transaction });

  const embeds = await EmbedModel.findAll({
    where: { id: embedIds },
  }, { transaction });

  conversationMessage.setDataValue('attachments', attachments);
  conversationMessage.setDataValue('embeds', embeds);
  conversationMessage.setDataValue('conversationUser', conversationUser);

  return conversationMessage;
};

/*
 * Export
 */

module.exports = ConversationMessageModel;
