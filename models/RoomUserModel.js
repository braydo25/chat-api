const UserModel = rootRequire('/models/UserModel');
const events = rootRequire('/libs/events');

const permissions = [
  'ROOM_ADMIN',
  'ROOM_MESSAGES_CREATE',
  'ROOM_MESSAGES_READ',
//  'ROOM_MESSAGES_UPDATE', not in use
//  'ROOM_MESSAGES_DELETE', not in use
  'ROOM_MESSAGE_PINS_CREATE',
  'ROOM_MESSAGE_PINS_DELETE',
  'ROOM_MESSAGE_REACTIONS_CREATE',
  'ROOM_MESSAGE_REACTIONS_READ',
//  'ROOM_MESSAGE_REACTIONS_UPDATE', not in use
//  'ROOM_MESSAGE_REACTIONS_DELETE', not in use
  'ROOM_USERS_CREATE',
  'ROOM_USERS_READ',
  'ROOM_USERS_UPDATE',
  'ROOM_USERS_DELETE',
];

/*
 * Model Definition
 */

const RoomUserModel = database.define('roomUser', {
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
  permissions: {
    type: Sequelize.JSON,
    allowNull: false,
    validate: {
      isValid(value) {
        value.forEach(permission => {
          if (!permissions.includes(permission)) {
            throw new Error('Invalid room user permission provided');
          }
        });
      },
    },
    defaultValue: [],
  },
}, {
  defaultScope: {
    attributes: [ 'id', 'userId', 'roomId', 'permissions' ],
    include: [ UserModel ],
  },
  scopes: {
    preview: () => ({
      attributes: [ 'id', 'permissions' ],
    }),
  },
});

/*
 * Hooks
 */

RoomUserModel.addHook('afterCreate', async (roomUser, options) => {
  const RoomModel = database.models.room;

  await RoomModel.update({ usersCount: database.literal('usersCount + 1') }, {
    where: { id: roomUser.roomId },
    transaction: options.transaction,
  });

  roomUser.publishEvent({ type: 'create', options });
});

RoomUserModel.addHook('afterUpdate', async (roomUser, options) => {
  roomUser.publishEvent({ type: 'update', options });
});

RoomUserModel.addHook('afterDestroy', async (roomUser, options) => {
  const RoomModel = database.models.room;

  await RoomModel.update({ usersCount: database.literal('usersCount - 1') }, {
    where: { id: roomUser.roomId },
    transaction: options.transaction,
  });

  roomUser.publishEvent({ type: 'delete', options });
});

/*
 * Events
 */

RoomUserModel.prototype.publishEvent = async function ({ type, options }) {
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

RoomUserModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_USER_CREATE',
    data: this,
  });
};

RoomUserModel.prototype._publishUpdateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_USER_UPDATE',
    data: this,
  });
};

RoomUserModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_USER_DELETE',
    data: {
      id: this.id,
      roomId: this.roomId,
    },
  });
};

/*
 * Export
 */

module.exports = RoomUserModel;
