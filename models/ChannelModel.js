/*
 * Model Definition
 */

const ChannelModel = database.define('channel', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  hashId: Sequelize.genericHashId(),
  roomId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
  },
});

/*
 * Instance Hooks
 */

ChannelModel.afterCreate(Sequelize.assignHashId);

/*
 * Export
 */

module.exports = ChannelModel;
