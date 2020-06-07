const UserModel = rootRequire('/models/UserModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');

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
      'accessLevel',
      'title',
      'impressionsCount',
      'usersCount',
      'createdAt',
    ],
  },
  scopes: {
    complete: userId => ({
      attributes: [
        'id',
        'accessLevel',
        'title',
        'impressionsCount',
        'usersCount',
        'createdAt',
      ],
      include: [
        {
          model: ConversationMessageModel.scope([
            { method: [ 'withAuthUserReactions', userId ] },
          ]),
          separate: true,
          order: [ [ 'id', 'DESC' ] ],
          limit: 25,
        },
        UserModel,
      ],
    }),
    preview: {
      attributes: [
        'id',
        'accessLevel',
        'title',
        'impressionsCount',
        'usersCount',
        'createdAt',
      ],
      include: [
        {
          model: ConversationMessageModel,
          as: 'previewConversationMessage',
        },
        {
          model: ConversationUserModel,
          as: 'previewConversationUsers',
          // limit: 5, TODO: this fails and causes a query with duplicate left joins?
        },
        UserModel,
      ],
    },
  },
});

/*
 * Class Methods
 */

ConversationModel.createWithAssociations = async function({ data, userIds = [], transaction }) {
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

  const users = await UserModel.findAll({
    where: { id: userIds },
  }, { transaction });

  conversation.setDataValue('user', users.find(user => user.id === data.userId));
  conversation.setDataValue('previewConversationUsers', conversationUsers);

  conversationUsers.forEach(conversationUser => {
    conversationUser.setDataValue('user', users.find(user => {
      return conversationUser.userId === user.id;
    }));
  });

  return conversation;
};

ConversationModel.findOneWithUsers = async function({ authUserId, userIds, where }) {
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
  }) : undefined;

  return conversation;
};

/*
 * Export
 */

module.exports = ConversationModel;
