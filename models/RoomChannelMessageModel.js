/*
 * Model Definition
 */

const RoomChannelMessageModel = database.define('roomChannelMessage', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  roomChannelId: {
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

module.exports = RoomChannelMessageModel;
