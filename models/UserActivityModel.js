const RoomRepostModel = rootRequire('/models/RoomRepostModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');
const events = rootRequire('/libs/events');

/*
 * Model Definition
 */

const UserActivityModel = database.define('userActivity', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  roomRepostId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
  userFollowerId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'createdAt',
    ],
    include: [
      {
        model: RoomRepostModel.scope('activityPreview'),
        required: false,
      },
      {
        model: UserFollowerModel,
        required: false,
      },
    ],
    having: {
      [Sequelize.Op.or]: {
        'roomRepost.id': { [Sequelize.Op.ne]: null },
        'userFollower.id': { [Sequelize.Op.ne]: null },
      },
    },
  },
});

/*
 * Hooks
 */

UserActivityModel.addHook('afterCreate', async (userActivity, options) => {
  userActivity.publishEvent({ type: 'create', options });
});

/*
 * Events
 */

UserActivityModel.prototype.publishEvent = async function({ type, options }) {
  const { eventsTopic, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(eventsTopic) : eventMethod;

  if (eventMethod && eventsTopic) {
    if (transaction) {
      transaction.afterCommit(() => eventMethod());
    } else {
      eventMethod();
    }
  }
};

UserActivityModel.prototype._publishCreateEvent = async function(eventsTopic) {
  events.publish({
    topic: eventsTopic,
    name: 'USER_ACTIVITY_CREATE',
    data: this,
  });
};

/*
 * Export
 */

module.exports = UserActivityModel;
