/*
 * Model Definition
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationMessageAttachmentModel = rootRequire('/models/ConversationMessageAttachmentModel');
const ConversationMessageEmbedModel = rootRequire('/models/ConversationMessageEmbedModel');
const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserModel = rootRequire('/models/UserModel');

const ConversationMessageModel = database.define('conversationMessage', {
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
  text: {
    type: Sequelize.TEXT,
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
      {
        attributes: [
          'reaction',
          [ database.fn('COUNT', 'id'), 'count' ],
        ],
        model: ConversationMessageReactionModel.unscoped(),
        separate: true,
        group: [ 'reaction' ],
      },
      EmbedModel,
      UserModel,
    ],
  },
});

/*
 * Class Methods
 */

ConversationMessageModel.createWithAssociations = async function({ data, attachmentIds = [], embedIds = [], transaction }) {
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

  const user = await UserModel.findOne({
    where: { id:  data.userId },
  }, { transaction });

  conversationMessage.setDataValue('attachments', attachments);
  conversationMessage.setDataValue('embeds', embeds);
  conversationMessage.setDataValue('user', user);

  return conversationMessage;
};

/*
 * Export
 */

module.exports = ConversationMessageModel;
