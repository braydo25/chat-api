/*
 * Model Defintion
 */

const ConversationImpressionModel = database.define('conversationImpression', {
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
});

/*
 * Hooks
 */

ConversationImpressionModel.addHook('afterCreate', (conversationImpression, options) => {
  const ConversationModel = database.models.conversation;

  ConversationModel.update({ impressionsCount: database.literal('impressionsCount + 1') }, {
    where: { id: conversationImpression.conversationId },
    transaction: options.transaction,
  });
});

/*
 * Export
 */

module.exports = ConversationImpressionModel;
