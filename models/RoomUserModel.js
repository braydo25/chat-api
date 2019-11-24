/*
 * Model Definition
 */

const RoomUserModel = database.define('roomUser', {
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
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
});

/*
 * Instance Hooks
 */

RoomUserModel.afterCreate(Sequelize.assignHashId);

/*
 * Export
 */

module.exports = RoomUserModel;
