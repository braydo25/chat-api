/*
 * Model Definition
 */

const ChannelModel = database.define('channel', {
  id: Sequelize.generateGenericIdAttribute({ hashPrefix: 'c' }),
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
 * Export
 */

module.exports = ChannelModel;
