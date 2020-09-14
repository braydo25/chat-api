/*
 * Model Definition
 */

const UserRoomDataModel = database.define('userRoomData', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  roomId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  lastReadAt: {
    type: Sequelize.DATE(4),
    defaultValue: Sequelize.NOW,
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'lastReadAt',
    ],
  },
});

/*
 * Export
 */

module.exports = UserRoomDataModel;
