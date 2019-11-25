/*
 * Model Definition
 */

const RoomChannelMessageReactionModel = database.define('roomChannelMessageReaction', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  roomChannelMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

/*
 * Export
 */

module.exports = RoomChannelMessageReactionModel;
