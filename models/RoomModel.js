/*
 * Model Definition
 */

const RoomModel = database.define('room', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: {
      msg: 'The name you provided is already in use.',
    },
  },
  description: {
    type: Sequelize.STRING,
  },
  iconHash: {
    type: Sequelize.STRING,
  },
});

/*
 * Export
 */

module.exports = RoomModel;
