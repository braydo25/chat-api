const events = rootRequire('/libs/events');

/*
 * Model Definition
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const RoomMessageReactionModel = rootRequire('/models/RoomMessageReactionModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');

const RoomMessageModel = database.define('roomMessage', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  roomId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  roomUserId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  nonce: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  text: {
    type: Sequelize.TEXT,
    set(text) {
      if (text) {
        this.setDataValue('text', text.trim());
      }
    },
  },
  pinnedAt: {
    type: Sequelize.DATE(4),
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'roomId',
      'text',
      'createdAt',
      'updatedAt',
    ],
    include: [
      AttachmentModel,
      EmbedModel,
      {
        model: RoomUserModel,
        paranoid: false,
      },
    ],
  },
  scopes: {
    withReactions: () => ({
      include: [
        {
          attributes: [
            'reaction',
            [ database.fn('COUNT', 'id'), 'count' ],
          ],
          model: RoomMessageReactionModel.unscoped(),
          separate: true,
          group: [ 'roomMessageId', 'reaction' ],
        },
      ],
    }),
    withAuthUserReactions: userId => ({
      include: [
        {
          attributes: [
            'id',
            'reaction',
          ],
          model: RoomMessageReactionModel.unscoped(),
          as: 'authUserRoomMessageReactions',
          where: { userId },
          required: false,
        },
      ],
    }),
  },
});

/*
 * Hooks
 */

RoomMessageModel.addHook('afterCreate', (roomMessage, options) => {
  roomMessage.publishEvent({ type: 'create', options });
});

RoomMessageModel.addHook('afterUpdate', (roomMessage, options) => {
  roomMessage.publishEvent({ type: 'update', options });
});

RoomMessageModel.addHook('afterDestroy', (roomMessage, options) => {
  roomMessage.publishEvent({ type: 'delete', options });
});

/*
 * Class Methods
 */

RoomMessageModel.createWithAssociations = async function({ data, roomUser, attachmentIds = [], embedIds = [], eventsTopic, transaction }) {
  const RoomMessageAttachmentModel = database.models.roomMessageAttachment;
  const RoomMessageEmbedModel = database.models.roomMessageEmbed;

  attachmentIds = [ ...new Set(attachmentIds) ];
  embedIds = [ ...new Set(embedIds) ];

  if (!data.text && !attachmentIds.length && !embedIds.length) {
    throw new Error('You must provide text, an attachment, or embed.');
  }

  const attachments = await AttachmentModel.findAll({
    where: { id: attachmentIds },
  }, { transaction });

  const embeds = await EmbedModel.findAll({
    where: { id: embedIds },
  }, { transaction });

  const roomMessage = await RoomMessageModel.create(data, {
    eventsTopic,
    transaction,
    setDataValues: { attachments, embeds, roomUser },
  });

  await RoomMessageAttachmentModel.bulkCreate((
    attachmentIds.map(attachmentId => ({ roomMessageId: roomMessage.id, attachmentId }))
  ), { transaction });

  await RoomMessageEmbedModel.bulkCreate((
    embedIds.map(embedId => ({ roomMessageId: roomMessage.id, embedId }))
  ), { transaction });

  return roomMessage;
};

/*
 * Events
 */

RoomMessageModel.prototype.publishEvent = async function({ type, options }) {
  const { eventsTopic, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(eventsTopic) : eventMethod;
  eventMethod = (type === 'update') ? () => this._publishUpdateEvent(eventsTopic) : eventMethod;
  eventMethod = (type === 'delete') ? () => this._publishDeleteEvent(eventsTopic) : eventMethod;

  if (eventMethod && eventsTopic) {
    if (transaction) {
      transaction.afterCommit(() => eventMethod());
    } else {
      eventMethod();
    }
  }
};

RoomMessageModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_MESSAGE_CREATE',
    data: this,
  });
};

RoomMessageModel.prototype._publishUpdateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_MESSAGE_UPDATE',
    data: this,
  });
};

RoomMessageModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_MESSAGE_DELETE',
    data: {
      id: this.id,
      roomId: this.roomId,
    },
  });
};

/*
 * Export
 */

module.exports = RoomMessageModel;
