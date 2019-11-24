/*
 * Model Definition
 */

const RoomModel = database.define('room', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  hashId: Sequelize.genericHashId(),
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  iconHash: {
    type: Sequelize.STRING,
  },
});

/*
 * Instance Hooks
 */

RoomModel.afterCreate(Sequelize.assignHashId);

/*
 * Export
 */

module.exports = RoomModel;
