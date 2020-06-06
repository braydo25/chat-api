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
 * Export
 */

module.exports = ConversationImpressionModel;
