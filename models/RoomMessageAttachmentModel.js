/*
 * Model Definition
 */

const RoomMessageAttachmentModel = database.define('roomMessageAttachment', {
  roomMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  attachmentId: {
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

module.exports = RoomMessageAttachmentModel;
