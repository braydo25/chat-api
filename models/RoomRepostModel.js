const RoomModel = rootRequire('/models/RoomModel');
const UserModel = rootRequire('/models/UserModel');
const events = rootRequire('/libs/events');

/*
 * Model Defitinion
 */

const RoomRepostModel = database.define('roomRepost', {
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
}, {
  scopes: {
    complete: authUserId => ({
      attributes: [ 'id', 'userId', 'roomId' ],
      include: [
        {
          model: RoomModel.scope({ method: [ 'preview', authUserId ] }),
          required: true,
        },
        UserModel,
      ],
    }),
    activityPreview: () => ({
      attributes: [
        'id',
        'createdAt',
      ],
      include: [
        {
          model: RoomModel.scope('activityPreview'),
          required: true,
        },
        UserModel,
      ],
    }),
  },
});

/*
 * Hooks
 */

RoomRepostModel.addHook('afterCreate', (roomRepost, options) => {
  roomRepost.publishEvent({ type: 'create', options });
});

RoomRepostModel.addHook('afterDestroy', (roomRepost, options) => {
  roomRepost.publishEvent({ type: 'delete', options });
});

/*
 * Class Methods
 */

RoomRepostModel.findAllNormalized = async function({ authUserId, options }) {
  // TODO: it would be better if we could factor this into the RoomModel
  // complete scope somehow for just a singular rooms query to include
  // reposts as well..?

  const roomReposts = await RoomRepostModel.scope({
    method: [ 'complete', authUserId ],
  }).findAll(options);

  return roomReposts.map(roomRepost => ({
    ...roomRepost.toJSON().room,
    roomRepostId: roomRepost.id,
    roomRepostUser: roomRepost.user,
  }));
};

/*
 * Events
 */

RoomRepostModel.prototype.publishEvent = async function({ type, options }) {
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

RoomRepostModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_REPOST_CREATE',
    data: this,
  });
};

RoomRepostModel.prototype._publishDeleteEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'ROOM_REPOST_DELETE',
    data: {
      id: this.id,
      roomId: this.roomId,
    },
  });
};

/*
 * Export
 */

module.exports = RoomRepostModel;
