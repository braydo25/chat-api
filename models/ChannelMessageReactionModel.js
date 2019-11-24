/*
 * Model Definition
 */

const ChannelMessageReactionModel = database.define('channelMessageReaction', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  hashId: Sequelize.genericHashId(),
  channelMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

/*
 * Instance Hooks
 */

ChannelMessageReactionModel.afterCreate(Sequelize.assignHashId);

/*
 * Export
 */

module.exports = ChannelMessageReactionModel;
