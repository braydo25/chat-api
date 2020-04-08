const UserModel = rootRequire('/models/UserModel');

/*
 * Model Definition
 */

const ConversationMessageReactionModel = database.define('conversationMessageReaction', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  conversationMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  reaction: {
    type: Sequelize.STRING(3),
    allowNull: false,
    validate: {
      max: 3,
    },
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'reaction',
    ],
    include: [ UserModel.scope('noAvatar') ],
  },
});

/*
 * Export
 */

module.exports = ConversationMessageReactionModel;
