/*
 * Model Definition
 */

const RoomUserModel = database.define('roomUser', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  roomId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  permissions: {
    type: Sequelize.JSON,
    defaultValue: [ 'MEMBER' ],
  },
  banned: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

/*
 * Export
 */

module.exports = RoomUserModel;
