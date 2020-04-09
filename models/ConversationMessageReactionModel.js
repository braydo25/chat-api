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
      len: {
        args: [ 1, 3 ],
        msg: 'Reaction cannot be more than 3 characters.',
      },
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
