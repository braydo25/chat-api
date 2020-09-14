/*
 * Model Defintion
 */

const RoomImpressionModel = database.define('roomImpression', {
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
});

/*
 * Hooks
 */

RoomImpressionModel.addHook('afterCreate', (roomImpression, options) => {
  const RoomModel = database.models.room;

  RoomModel.update({ impressionsCount: database.literal('impressionsCount + 1') }, {
    where: { id: roomImpression.roomId },
    transaction: options.transaction,
  });
});

/*
 * Export
 */

module.exports = RoomImpressionModel;
