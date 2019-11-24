/*
 * Model Definition
 */

const ChannelMessageReactionModel = database.define('channelMessageReaction', {
  id: Sequelize.generateGenericIdAttribute({ hashPrefix: 'cmr' }),
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
 * Export
 */

module.exports = ChannelMessageReactionModel;
