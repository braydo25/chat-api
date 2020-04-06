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
  defaultScope: {
    attributes: [
      'id',
      'text',
      'createdAt',
      'updatedAt',
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

  const user = await database.models.user.findOne({
    include: [
      {
        model: database.models.attachment,
        as: 'avatarAttachment',
      },
    ],
    where: { id:  data.userId },
  }, { transaction });

  conversationMessage.setDataValue('attachments', attachments);
  conversationMessage.setDataValue('embeds', embeds);
  conversationMessage.setDataValue('user', user);

  return conversationMessage;
};

ConversationMessageModel.findAllWithAssociations = async function({ where }) {
  const conversationMessages = await database.models.conversationMessage.findAll({
    include: [
      database.models.attachment,
      database.models.embed,
      {
        model: database.models.user,
        include: [
          {
            model: database.models.attachment,
            as: 'avatarAttachment',
          },
        ],
      },
    ],
    where,
  });

  return conversationMessages;
};

/*
 * Export
 */

module.exports = ConversationMessageModel;
