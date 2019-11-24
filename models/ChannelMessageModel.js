/*
 * Model Definition
 */

const ChannelMessageModel = database.define('channelMessage', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  hashId: Sequelize.genericHashId(),
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
 * Instance Hooks
 */

ChannelMessageModel.afterCreate(Sequelize.assignHashId);

/*
 * Export
 */

module.exports = ChannelMessageModel;
