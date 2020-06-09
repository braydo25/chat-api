const ConversationModel = rootRequire('/models/ConversationModel');

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

ConversationImpressionModel.addHook('afterCreate', conversationImpression => {
  ConversationModel.update({ usersCount: database.literal('usersCount + 1') }, {
    where: { id: conversationImpression.conversationId },
  });
});

/*
 * Export
 */

module.exports = ConversationImpressionModel;
