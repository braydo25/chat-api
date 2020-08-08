const { v4: uuidV4 }  = require('uuid');
const events = rootRequire('/libs/events');
const accessLevels = [ 'public', 'protected', 'private' ];

/*
 * Model Definition
 */

const ConversationModel = database.define('conversation', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  previewConversationMessageId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
  eventsTopic: {
    type: Sequelize.STRING,
    unique: true,
    defaultValue: () => {
      return `conversation-${uuidV4()}`;
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
          throw new Error('A title must be provided for public and protected conversations.');
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
}, {
  defaultScope: {
    attributes: [
      'id',
      'userId',
      'eventsTopic',
      'accessLevel',
      'title',
      'impressionsCount',
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
        'updatedAt',
        'createdAt',
      ],
      include: [
        {
          model: database.models.conversationMessage.scope('withReactions', [
            { method: [ 'withAuthUserReactions', authUserId ] },
          ]),
          as: 'pinnedConversationMessages',
          separate: true,
          where: {
            pinnedAt: { [Sequelize.Op.ne]: null },
          },
          order: [ [ 'pinnedAt', 'DESC' ] ],
        },
        {
          model: database.models.conversationMessage.scope('withReactions', [
            { method: [ 'withAuthUserReactions', authUserId ] },
          ]),
          separate: true,
          order: [ [ 'id', 'DESC' ] ],
          limit: 25,
        },
        {
          model: database.models.conversationUser,
          as: 'authConversationUser',
          where: { userId: authUserId },
          required: false,
        },
        {
          model: database.models.conversationRepost,
          as: 'authUserConversationRepost',
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
        'previewConversationMessageId',
        'eventsTopic',
        'accessLevel',
        'title',
        'impressionsCount',
        'usersCount',
        'updatedAt',
        'createdAt',
      ],
      include: [
        {
          model: database.models.conversationMessage,
          as: 'previewConversationMessage',
        },
        {
          model: database.models.conversationUser,
          as: 'previewConversationUsers',
          // limit: 5, TODO: this fails and causes a query with duplicate left joins?
        },
        {
          model: database.models.conversationUser.unscoped().scope('preview'),
          as: 'authConversationUser',
          where: { userId: authUserId },
          required: false,
        },
        {
          model: database.models.userConversationData,
          as: 'authUserConversationData',
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

ConversationModel.addHook('afterUpdate', (conversation, options) => {
  conversation.publishEvent({ type: 'update', options });
});

ConversationModel.addHook('afterDestroy', (conversation, options) => {
  conversation.publishEvent({ type: 'delete', options });
});

/*
 * Class Methods
 */

ConversationModel.createWithAssociations = async function({ data, userIds = [], message }) {
  const ConversationMessageModel = database.models.conversationMessage;
  const ConversationUserModel = database.models.conversationUser;
  const UserConversationDataModel = database.models.userConversationData;
  const UserModel = database.models.user;
  const attachmentIds = (Array.isArray(message.attachmentIds)) ? message.attachmentIds : [];
  const embedIds = (Array.isArray(message.embedIds)) ? message.embedIds : [];

  userIds = [ ...new Set([ data.userId, ...userIds.map(id => +id) ]) ];

  const transaction = await database.transaction();

  try {
    const conversation = await ConversationModel.create({
      userId: data.userId,
      accessLevel: data.accessLevel,
      title: data.title,
      usersCount: userIds.length,
    }, { transaction });

    const conversationUsers = await ConversationUserModel.bulkCreate((
      userIds.map(userId => ({
        userId,
        conversationId: conversation.id,
        permissions: (userId === data.userId) ? [
          'CONVERSATION_ADMIN',
        ] : [
          'CONVERSATION_MESSAGES_CREATE',
          'CONVERSATION_MESSAGES_READ',
          'CONVERSATION_MESSAGE_REACTIONS_CREATE',
          'CONVERSATION_MESSAGE_REACTIONS_READ',
          'CONVERSATION_USERS_CREATE',
          'CONVERSATION_USERS_READ',
        ],
      }))
    ), { transaction });

    const authConversationUser = conversationUsers.find(conversationUser => {
      return conversationUser.userId === data.userId;
    });

    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        conversationId: conversation.id,
        conversationUserId: authConversationUser.id,
        text: message.text,
        nonce: message.nonce,
      },
      conversationUser: authConversationUser,
      attachmentIds,
      embedIds,
      transaction,
    });

    await conversation.update({
      previewConversationMessageId: conversationMessage.id,
    }, { transaction, ignoreEvent: true });

    await UserConversationDataModel.create({
      userId: data.userId,
      conversationId: conversation.id,
      lastReadAt: new Date(),
    }, { transaction });

    await transaction.commit();

    const users = await UserModel.findAll({
      where: { id: userIds },
    });

    conversation.setDataValue('authConversationUser', authConversationUser);
    conversation.setDataValue('conversationMessages', [ conversationMessage ]);
    conversation.setDataValue('previewConversationMessage', conversationMessage);
    conversation.setDataValue('previewConversationUsers', conversationUsers);
    conversation.setDataValue('user', users.find(user => user.id === data.userId));
    conversationUsers.forEach(conversationUser => {
      conversationUser.setDataValue('user', users.find(user => {
        return conversationUser.userId === user.id;
      }));
    });

    conversation.publishEvent({ type: 'create', conversationUsers });

    return conversation;
  } catch(error) {
    await transaction.rollback();

    throw error;
  }
};

ConversationModel.findOneWithUsers = async function({ authUserId, userIds, where }) {
  const ConversationUserModel = database.models.conversationUser;

  userIds = [ ...new Set(userIds) ];

  const match = await ConversationUserModel.unscoped().findOne({
    attributes: [ 'conversationId' ],
    include: [
      {
        attributes: [],
        model: ConversationModel,
        where,
        required: true,
      },
    ],
    group: [ 'conversationId' ],
    having: database.literal([
      `SUM(conversationUser.userId IN (${userIds.join(',')})) = COUNT(conversationUser.id)`,
      `AND ${userIds.length} = COUNT(conversationUser.id)`,
    ].join(' ')),
  });

  const conversation = (match) ? await ConversationModel.scope({ method: [ 'complete', authUserId ] }).findOne({
    where: { id: match.conversationId },
  }) : null;

  return conversation;
};

ConversationModel.findAllWithUser = async function({ authUserId, where, order, limit }) {
  const ConversationUserModel = database.models.conversationUser;

  return await ConversationModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    include: [
      {
        attributes: [],
        model: ConversationUserModel,
        where: { userId: authUserId },
        required: true,
      },
    ],
    where,
    order,
    limit,
  });
};

ConversationModel.findAllByFollowedUsers = async function({ authUserId, where, order, limit }) {
  const ConversationRepostModel = database.models.conversationRepost;
  const UserFollowerModel = database.models.userFollower;

  const followedUsers = await UserFollowerModel.findAll({
    attributes: [ 'userId' ],
    where: { followerUserId: authUserId },
  });

  const followedUserIds = followedUsers.map(followedUser => followedUser.userId);

  const conversationReposts = await ConversationRepostModel.findAllNormalized({
    authUserId,
    options: {
      where: {
        userId: followedUserIds,
        ...where,
      },
      limit,
    },
  });

  const conversations = await ConversationModel.scope({ method: [ 'preview', authUserId ] }).findAll({
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
    ...conversationReposts,
    ...conversations,
  ];
};

ConversationModel.findAllRelevantConversationsForUser = async function({ authUserId, where, order, limit }) {
  return await ConversationModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    where: {
      accessLevel: [ 'public', 'protected' ],
      ...where,
    },
    order,
    limit,
  });
};

ConversationModel.getEventsTopic = async function(conversationId) {
  const conversation = await ConversationModel.unscoped().findOne({
    attributes: [ 'eventsTopic' ],
    where: { id: conversationId },
  });

  return conversation.eventsTopic;
};

/*
 * Instance Methods
 */

ConversationModel.prototype.sendNotificationToConversationUsers = async function({ sendingUserId, title, message, data }) {
  const ConversationUserModel = database.models.conversationUser;
  const UserDeviceModel = database.models.userDevice;

  const conversationUsers = await ConversationUserModel.unscoped().findAll({
    attributes: [ 'userId' ],
    where: { conversationId: this.id },
  });

  conversationUsers.forEach(conversationUser => {
    if (conversationUser.userId === sendingUserId) {
      return;
    }

    UserDeviceModel.sendPushNotificationForUserId({
      userId: conversationUser.userId,
      title,
      message,
      data,
    });
  });
};

/*
 * Events
 */

ConversationModel.prototype.publishEvent = async function({ type, options, conversationUsers }) {
  const { ignoreEvent, transaction } = options || {};
  let eventMethod = null;

  eventMethod = (type === 'create') ? () => this._publishCreateEvent(conversationUsers) : eventMethod;
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

ConversationModel.prototype._publishCreateEvent = async function(conversationUsers) {
  const UserModel = database.models.user;

  const eventUsers = await UserModel.unscoped().findAll({
    attributes: [ 'id', 'eventsTopic' ],
    where: { id: conversationUsers.map(conversationUser => conversationUser.userId) },
  });

  const eventData = { ...this.toJSON() };

  delete eventData.conversationMessages;

  eventUsers.forEach(eventUser => {
    const authConversationUser = conversationUsers.find(conversationUser => {
      return conversationUser.userId === eventUser.id;
    });

    events.publish({
      topic: eventUser.eventsTopic,
      name: 'CONVERSATION_CREATE',
      data: { ...eventData, authConversationUser },
    });
  });
};

ConversationModel.prototype._publishUpdateEvent = async function() {
  events.publish({
    topic: this.eventsTopic,
    name: 'CONVERSATION_UPDATE',
    data: this,
  });
};

ConversationModel.prototype._publishDeleteEvent = async function() {
  events.publish({
    topic: this.eventsTopic,
    name: 'CONVERSATION_DELETE',
    data: { id: this.id },
  });
};

/*
 * Export
 */

module.exports = ConversationModel;
