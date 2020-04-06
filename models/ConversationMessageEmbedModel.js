/*
 * Model Definition
 */

const ConversationMessageEmbedModel = database.define('conversationMessageEmbed', {
  conversationMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  embedId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
}, {
  defaultScope: {
    attributes: [],
  },
});

/*
 * Export
 */

module.exports = ConversationMessageEmbedModel;
