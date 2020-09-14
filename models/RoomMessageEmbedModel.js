/*
 * Model Definition
 */

const RoomMessageEmbedModel = database.define('roomMessageEmbed', {
  roomMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  embedId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
}, {
  defaultScope: {
    attributes: [],
  },
});

/*
 * Export
 */

module.exports = RoomMessageEmbedModel;
