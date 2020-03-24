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
 * Export
 */

module.exports = ConversationMessageModel;
