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
  eventsToken: {
    type: Sequelize.UUID,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
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
      'eventsToken',
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
        'eventsToken',
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
        'eventsToken',
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
          model: database.models.userConversationData,
          as: 'authUserConversationData',
          where: { userId: authUserId },
          required: false,
        },
        database.models.user,
      ],
    }),
  },
});

/*
 * Class Methods
 */

ConversationModel.createWithAssociations = async function({ data, userIds = [], transaction }) {
  const ConversationUserModel = database.models.conversationUser;
  const UserConversationDataModel = database.models.userConversationData;
  const UserModel = database.models.user;

  userIds = [ ...new Set([ data.userId, ...userIds.map(id => +id) ]) ];

  const conversation = await ConversationModel.create({
    ...data,
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

  await UserConversationDataModel.create({
    userId: data.userId,
    conversationId: conversation.id,
    lastReadAt: new Date(),
  }, { transaction });

  const users = await UserModel.findAll({
    where: { id: userIds },
  }, { transaction });

  conversation.setDataValue('user', users.find(user => user.id === data.userId));
  conversation.setDataValue('previewConversationUsers', conversationUsers);
  conversation.setDataValue('authConversationUser', conversationUsers.find(conversationUser => {
    return conversationUser.userId === data.userId;
  }));

  conversationUsers.forEach(conversationUser => {
    conversationUser.setDataValue('user', users.find(user => {
      return conversationUser.userId === user.id;
    }));
  });

  return conversation;
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

ConversationModel.findAllByFollowedUsers = async function({ authUserId, order, limit }) {
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
      where: { userId: followedUserIds },
      limit,
    },
  });

  const conversations = await ConversationModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    where: {
      accessLevel: [ 'public', 'protected' ],
      userId: followedUserIds,
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

ConversationModel.findAllRelevantConversationsForUser = async function({ authUserId, order, limit }) {
  return await ConversationModel.scope({ method: [ 'preview', authUserId ] }).findAll({
    where: { accessLevel: [ 'public', 'protected' ] },
    order,
    limit,
  });
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
 * Export
 */

module.exports = ConversationModel;
