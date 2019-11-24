/*
 * Model Definition
 */

const RoomUserModel = database.define('roomUser', {
  id: Sequelize.generateGenericIdAttribute({ hashPrefix: 'ru' }),
  roomId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
});

/*
 * Export
 */

module.exports = RoomUserModel;
