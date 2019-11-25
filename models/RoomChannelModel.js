/*
 * Model Definition
 */

const RoomChannelModel = database.define('roomChannel', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
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

module.exports = RoomChannelModel;
