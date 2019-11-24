/*
 * Model Definition
 */

const RoomModel = database.define('room', {
  id: Sequelize.generateGenericIdAttribute({ hashPrefix: 'r' }),
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
 * Export
 */

module.exports = RoomModel;
