const UserModel = rootRequire('/models/UserModel');
const events = rootRequire('/libs/events');

/*
 * Model Definition
 */

const RoomMessageReactionModel = database.define('roomMessageReaction', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  roomMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  reaction: {
    type: Sequelize.STRING(3),
    allowNull: false,
    validate: {
      len: {
        args: [ 1, 3 ],
        msg: 'Reaction cannot be more than 3 characters.',
      },
    },
  },
}, {
  collate: 'utf8mb4_bin',
  defaultScope: {
    attributes: [
      'id',
      'userId',
      'roomMessageId',
      'reaction',
      'createdAt',
    ],
    include: [ UserModel.scope('noAvatar') ],
  },
  indexes: [
    {
      fields: [ 'reaction' ],
      unique: false,
    },
  ],
});

/*
 * Hooks
 */

RoomMessageReactionModel.addHook('afterCreate', (roomMessageReaction, options) => {
  roomMessageReaction.publishEvent({ type: 'create', options });
});

RoomMessageReactionModel.addHook('afterDestroy', (roomMessageReaction, options) => {
  roomMessageReaction.publishEvent({ type: 'delete', options });
});

/*
 * Events
 */

RoomMessageReactionModel.prototype.publishEvent = async function({ type, options }) {
  const { eventsTopic, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(eventsTopic) : eventMethod;
  eventMethod = (type === 'delete') ? () => this._publishDeleteEvent(eventsTopic) : eventMethod;

  if (eventMethod && eventsTopic) {
    if (transaction) {
      transaction.afterCommit(() => eventMethod());
    } else {
      eventMethod();
    }
  }
};

RoomMessageReactionModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_MESSAGE_REACTION_CREATE',
    data: this,
  });
};

RoomMessageReactionModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_MESSAGE_REACTION_DELETE',
    data: this,
  });
};

/*
 * Export
 */

module.exports = RoomMessageReactionModel;
