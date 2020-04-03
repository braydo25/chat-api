/*
 * Model Definition
 */

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
  validate: {
    hasContent: function() {
      if (!this.text) {
        throw new Error('Conversation message text must be provided.');
      }
    },
  },
});

/*
 * Class Methods
 */

ConversationMessageModel.createWithAssociations = async function({ data, attachmentIds = [], embedIds = [], transaction }) {
  attachmentIds = [ ...new Set(attachmentIds) ];
  embedIds = [ ...new Set(embedIds) ];

  const conversationMessage = await this.create(data, { transaction });

  await database.models.conversationMessageAttachment.bulkCreate((
    attachmentIds.map(attachmentId => ({ conversationMessageId: conversationMessage.id, attachmentId }))
  ), { transaction });

  await database.models.conversationMessageEmbed.bulkCreate((
    embedIds.map(embedId => ({ conversationMessageId: conversationMessage.id, embedId }))
  ), { transaction });

  const attachments = await database.models.attachment.findAll({
    where: { id: attachmentIds },
  }, { transaction });

  const embeds = await database.models.embed.findAll({
    where: { id: embedIds },
  }, { transaction });

  conversationMessage.setDataValue('attachments', attachments);
  conversationMessage.setDataValue('embeds', embeds);

  return conversationMessage;
};

/*
 * Export
 */

module.exports = ConversationMessageModel;
