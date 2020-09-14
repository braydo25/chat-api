const { v4: uuidV4 }  = require('uuid');
const events = rootRequire('/libs/events');
const accessLevels = [ 'public', 'protected', 'private' ];

/*
 * Model Definition
 */

const RoomModel = database.define('room', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  previewRoomMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
  eventsTopic: {
    type: Sequelize.STRING,
    unique: true,
    defaultValue: () => {
      return `room-${uuidV4()}`;
    },
  },
  accessLevel: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [ accessLevels ],
        msg: 'The access level provided is invalid.',
      },
    },
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      hasTitle(value) {
        if (!value && this.getDataValue('accessLevel') !== 'private') {
          throw new Error('A title must be provided for public and protected rooms.');
        }
      },
    },
  },
  impressionsCount: {
    type: Sequelize.INTEGER(10),
    defaultValue: 1,
  },
  usersCount: {
    type: Sequelize.INTEGER(10),
    defaultValue: 1,
  },
  lastMessageAt: {
    type: Sequelize.DATE(4),
    defaultValue: Sequelize.NOW,
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'userId',
      'eventsTopic',
      'accessLevel',
      'title',
      'impressionsCount',
      'lastMessageAt',
      'usersCount',
      'createdAt',
    ],
  },
  scopes: {
    complete: authUserId => ({
      attributes: [
        'id',
        'eventsTopic',
        'accessLevel',
        'title',
        'impressionsCount',
        'usersCount',
        'lastMessageAt',
        'updatedAt',
        'createdAt',
      ],
      include: [
        {
          model: database.models.roomMessage.scope('withReactions', [
            { method: [ 'withAuthUserReactions', authUserId ] },
          ]),
          as: 'pinnedRoomMessages',
          separate: true,
          where: {
            pinnedAt: { [Sequelize.Op.ne]: null },
          },
          order: [ [ 'pinnedAt', 'DESC' ] ],
        },
        {
          model: database.models.roomMessage.scope('withReactions', [
            { method: [ 'withAuthUserReactions', authUserId ] },
          ]),
          separate: true,
          order: [ [ 'id', 'DESC' ] ],
          limit: 25,
        },
        {
          model: database.models.roomUser,
          as: 'authRoomUser',
          where: { userId: authUserId },
          required: false,
        },
        {
          model: database.models.roomRepost,
          as: 'authUserRoomRepost',
          where: { userId: authUserId },
          required: false,
        },
        database.models.user,
      ],
    }),
    preview: authUserId => ({
      attributes: [
        'id',
        'userId',
        'previewRoomMessageId',
        'eventsTopic',
        'accessLevel',
        'title',
        'impressionsCount',
        'usersCount',
        'lastMessageAt',
        'updatedAt',
        'createdAt',
      ],
      include: [
        {
          model: database.models.roomMessage,
          as: 'previewRoomMessage',
        },
        {
          model: database.models.roomUser,
          as: 'previewRoomUsers',
          // limit: 5, TODO: this fails and causes a query with duplicate left joins?
        },
        {
          model: database.models.roomUser.unscoped().scope('preview'),
          as: 'authRoomUser',
          where: { userId: authUserId },
          required: false,
        },
        {
          model: database.models.userRoomData,
          as: 'authUserRoomData',
          where: { userId: authUserId },
          required: false,
        },
        database.models.user,
      ],
    }),
    activityPreview: () => ({
      attributes: [ 'id', 'title' ],
    }),
  },
});

/*
 * Hooks
 */

RoomModel.addHook('afterUpdate', (room, options) => {
  room.publishEvent({ type: 'update', options });
});

RoomModel.addHook('afterDestroy', (room, options) => {
  room.publishEvent({ type: 'delete', options });
});

/*
 * Class Methods
 */

RoomModel.createWithAssociations = async function({ data, userIds = [], message }) {
  const RoomMessageModel = database.models.roomMessage;
  const RoomUserModel = database.models.roomUser;
  const UserRoomDataModel = database.models.userRoomData;
  const UserModel = database.models.user;
  const attachmentIds = (Array.isArray(message.attachmentIds)) ? message.attachmentIds : [];
  const embedIds = (Array.isArray(message.embedIds)) ? message.embedIds : [];

  userIds = [ ...new Set([ data.userId, ...userIds.map(id => +id) ]) ];

  const transaction = await database.transaction();

  try {
    const room = await RoomModel.create({
      userId: data.userId,
      accessLevel: data.accessLevel,
      title: data.title,
      usersCount: userIds.length,
    }, { transaction });

    const roomUsers = await RoomUserModel.bulkCreate((
      userIds.map(userId => ({
        userId,
        roomId: room.id,
        permissions: (userId === data.userId) ? [
          'ROOM_ADMIN',
        ] : [
          'ROOM_MESSAGES_CREATE',
          'ROOM_MESSAGES_READ',
          'ROOM_MESSAGE_REACTIONS_CREATE',
          'ROOM_MESSAGE_REACTIONS_READ',
          'ROOM_USERS_CREATE',
          'ROOM_USERS_READ',
        ],
      }))
    ), { transaction });

    const authRoomUser = roomUsers.find(roomUser => {
      return roomUser.userId === data.userId;
    });

    const roomMessage = await RoomMessageModel.createWithAssociations({
      data: {
        roomId: room.id,
        roomUserId: authRoomUser.id,
        text: message.text,
        nonce: message.nonce,
      },
      roomUser: authRoomUser,
      attachmentIds,
      embedIds,
      transaction,
    });

    await room.update({
      previewRoomMessageId: roomMessage.id,
      lastMessageAt: new Date(),
    }, { transaction, ignoreEvent: true });

    await UserRoomDataModel.create({
      userId: data.userId,
      roomId: room.id,
      lastReadAt: new Date(),
    }, { transaction });

    await transaction.commit();

    const users = await UserModel.findAll({
      where: { id: userIds },
    });

    room.setDataValue('authRoomUser', authRoomUser);
    room.setDataValue('roomMessages', [ roomMessage ]);
    room.setDataValue('previewRoomMessage', roomMessage);
    room.setDataValue('previewRoomUsers', roomUsers);
    room.setDataValue('user', users.find(user => user.id === data.userId));
    roomUsers.forEach(roomUser => {
      roomUser.setDataValue('user', users.find(user => {
        return roomUser.userId === user.id;
      }));
    });

    room.publishEvent({ type: 'create', roomUsers });

    return room;
  } catch(error) {
    await transaction.rollback();

    throw error;
  }
};

RoomModel.findOneWithUsers = async function({ authUserId, userIds, where }) {
  const RoomUserModel = database.models.roomUser;

  userIds = [ ...new Set(userIds) ];

  const match = await RoomUserModel.unscoped().findOne({
    attributes: [ 'roomId' ],
    include: [
      {
        attributes: [],
        model: RoomModel,
        where,
        required: true,
      },
    ],
    group: [ 'roomId' ],
    having: database.literal([
      `SUM(roomUser.userId IN (${userIds.join(',')})) = COUNT(roomUser.id)`,
      `AND ${userIds.length} = COUNT(roomUser.id)`,
    ].join(' ')),
  });

  const room = (match) ? await RoomModel.scope({ method: [ 'complete', authUserId ] }).findOne({
    where: { id: match.roomId },
  }) : null;

  return room;
};

RoomModel.findAllWithUser = async function({ authUserId, where, order, limit }) {
  const RoomUserModel = database.models.roomUser;

  return await RoomModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    include: [
      {
        attributes: [],
        model: RoomUserModel,
        where: { userId: authUserId },
        required: true,
      },
    ],
    where,
    order,
    limit,
  });
};

RoomModel.findAllByFollowedUsers = async function({ authUserId, where, order, limit }) {
  const RoomRepostModel = database.models.roomRepost;
  const UserFollowerModel = database.models.userFollower;

  const followedUsers = await UserFollowerModel.findAll({
    attributes: [ 'userId' ],
    where: { followerUserId: authUserId },
  });

  const followedUserIds = followedUsers.map(followedUser => followedUser.userId);

  const roomReposts = await RoomRepostModel.findAllNormalized({
    authUserId,
    options: {
      where: {
        userId: followedUserIds,
        ...where,
      },
      limit,
    },
  });

  const rooms = await RoomModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    where: {
      accessLevel: [ 'public', 'protected' ],
      userId: followedUserIds,
      ...where,
    },
    order,
    limit,
  });

  // TODO: look into single query?
  return [
    ...roomReposts,
    ...rooms,
  ];
};

RoomModel.findAllRelevantRoomsForUser = async function({ authUserId, where, order, limit }) {
  return await RoomModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    where: {
      accessLevel: [ 'public', 'protected' ],
      ...where,
    },
    order,
    limit,
  });
};

RoomModel.getEventsTopic = async function(roomId) {
  const room = await RoomModel.unscoped().findOne({
    attributes: [ 'eventsTopic' ],
    where: { id: roomId },
  });

  return room.eventsTopic;
};

/*
 * Instance Methods
 */

RoomModel.prototype.sendNotificationToRoomUsers = async function({ sendingUserId, title, message, data }) {
  const RoomUserModel = database.models.roomUser;
  const UserDeviceModel = database.models.userDevice;

  const roomUsers = await RoomUserModel.unscoped().findAll({
    attributes: [ 'userId' ],
    where: { roomId: this.id },
  });

  roomUsers.forEach(roomUser => {
    if (roomUser.userId === sendingUserId) {
      return;
    }

    UserDeviceModel.sendPushNotificationForUserId({
      userId: roomUser.userId,
      title,
      message,
      data,
    });
  });
};

/*
 * Events
 */

RoomModel.prototype.publishEvent = async function({ type, options, roomUsers }) {
  const { ignoreEvent, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(roomUsers) : eventMethod;
  eventMethod = (type === 'update') ? () => this._publishUpdateEvent() : eventMethod;
  eventMethod = (type === 'delete') ? () => this._publishDeleteEvent() : eventMethod;

  if (eventMethod && !ignoreEvent) {
    if (transaction) {
      transaction.afterCommit(() => eventMethod());
    } else {
      eventMethod();
    }
  }
};

RoomModel.prototype._publishCreateEvent = async function(roomUsers) {
  const UserModel = database.models.user;

  const eventUsers = await UserModel.unscoped().findAll({
    attributes: [ 'id', 'eventsTopic' ],
    where: { id: roomUsers.map(roomUser => roomUser.userId) },
  });

  const eventData = { ...this.toJSON() };

  delete eventData.roomMessages;

  eventUsers.forEach(eventUser => {
    const authRoomUser = roomUsers.find(roomUser => {
      return roomUser.userId === eventUser.id;
    });

    events.publish({
      topic: eventUser.eventsTopic,
      name: 'ROOM_CREATE',
      data: { ...eventData, authRoomUser },
    });
  });
};

RoomModel.prototype._publishUpdateEvent = async function() {
  events.publish({
    topic: this.eventsTopic,
    name: 'ROOM_UPDATE',
    data: this,
  });
};

RoomModel.prototype._publishDeleteEvent = async function() {
  events.publish({
    topic: this.eventsTopic,
    name: 'ROOM_DELETE',
    data: { id: this.id },
  });
};

/*
 * Export
 */

module.exports = RoomModel;
