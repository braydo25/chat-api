/*
 * Model Definition
 */

const ChannelMessageModel = database.define('channelMessage', {
  id: Sequelize.generateGenericIdAttribute({ hashPrefix: 'cm' }),
  channelId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

/*
 * Export
 */

module.exports = ChannelMessageModel;
