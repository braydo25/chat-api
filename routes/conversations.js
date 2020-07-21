/*
 * Route: /conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationImpressionModel = rootRequire('/models/ConversationImpressionModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const UserModel = rootRequire('/models/UserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationAuthorize = rootRequire('/middlewares/conversations/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userConversationPermissions = rootRequire('/middlewares/users/conversations/permissions');
const events = rootRequire('/libs/events');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevels, feed, privateUserIds, search, limit } = request.query;

  if (accessLevels) {
    const conversations = await ConversationModel.findAllWithUser({
      authUserId: user.id,
      where: { accessLevel: accessLevels },
      order: [ [ 'updatedAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? limit : 5,
    });

    return response.success(conversations);
  }

  if (feed) {
    const conversations = await ConversationModel.findAllByFollowedUsers({
      authUserId: user.id,
      order: [ [ 'createdAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? limit : 5,
    });

    return response.success(conversations);
  }

  if (privateUserIds) {
    const privateConversation = await ConversationModel.findOneWithUsers({
      authUserId: user.id,
      userIds: [ ...new Set([ user.id, ...privateUserIds.map(id => +id) ]) ],
      where: { accessLevel: 'private' },
    });

    return response.success(privateConversation);
  }

  if (search) {
    const searchConversations = await ConversationModel.scope({ method: [ 'preview', user.id ] }).findAll({
      where: {
        accessLevel: [ 'public', 'protected' ],
        title: { [Sequelize.Op.like]: `%${search}%` },
      },
      order: [ [ 'updatedAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? Math.floor(limit / 2) : 10,
    });

    // TODO: support searching private convos, either by users in them or content?

    response.success(searchConversations);
  }

  const relevantConversations = await ConversationModel.findAllRelevantConversationsForUser({
    authUserId: user.id,
    order: [ [ 'createdAt', 'DESC' ] ],
    limit: (limit && limit < 25) ? limit : 10,
  });

  response.success(relevantConversations);
}));

router.get('/:conversationId', userAuthorize);
router.get('/:conversationId', conversationAssociate);
router.get('/:conversationId', userConversationPermissions({
  anyAccessLevel: [ 'CONVERSATION_MESSAGES_READ' ],
  waiveNonConversationUser: [ 'public', 'protected' ],
}));
router.get('/:conversationId', asyncMiddleware(async (request, response) => {
  const { conversation, user } = request;
  const completeConversation = await ConversationModel.scope({ method: [ 'complete', user.id ] }).findOne({
    where: { id: conversation.id },
  });

  ConversationImpressionModel.create({
    userId: user.id,
    conversationId: conversation.id,
  });

  response.success(completeConversation);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevel, title } = request.body;
  const message = request.body.message || {};
  const attachmentIds = (Array.isArray(message.attachmentIds)) ? message.attachmentIds : [];
  const embedIds = (Array.isArray(message.embedIds)) ? message.embedIds : [];
  const userIds = (Array.isArray(request.body.userIds)) ? request.body.userIds : [];

  const transaction = await database.transaction();

  if (accessLevel === 'private') {
    const existingConversation = await ConversationModel.findOneWithUsers({
      authUserId: user.id,
      userIds: [ ...new Set([ user.id, ...userIds.map(userId => +userId) ]) ],
      where: { accessLevel: 'private' },
    });

    if (existingConversation) {
      return response.respond(409, existingConversation);
    }
  }

  try {
    const conversation = await ConversationModel.createWithAssociations({
      data: {
        userId: user.id,
        accessLevel,
        title,
      },
      userIds,
      transaction,
    });

    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        text: message.text,
        nonce: message.nonce,
      },
      attachmentIds,
      embedIds,
      transaction,
    });

    conversation.previewConversationMessageId = conversationMessage.id;

    await conversation.save({ transaction });

    await transaction.commit();

    const createdConversation = {
      ...conversation.toJSON(),
      previewConversationMessage: conversationMessage.toJSON(),
      conversationMessages: [ conversationMessage.toJSON() ],
    };

    const eventUsers = await UserModel.unscoped().findAll({
      attributes: [ 'accessToken' ],
      where: { id: userIds },
    });

    eventUsers.forEach(eventUser => {
      const eventData = Object.assign({}, createdConversation);

      delete eventData.authConversationUser;
      delete eventData.conversationMessages;

      events.publish({
        topic: `user-${eventUser.accessToken}`,
        name: 'CONVERSATION_CREATE',
        data: eventData,
      });
    });

    response.success(createdConversation);
  } catch(error) {
    await transaction.rollback();

    throw error;
  }
}));

/*
 * PATCH
 */

router.patch('/:conversationId', userAuthorize);
router.patch('/:conversationId', conversationAuthorize);
router.patch('/:conversationId', asyncMiddleware(async (request, response) => {
  const { conversation } = request;

  conversation.accessLevel = request.body.accessLevel || conversation.accessLevel;
  conversation.title = (request.body.title !== undefined) ? request.body.title : conversation.title;

  await conversation.save();

  events.publish({
    topic: `conversation-${conversation.eventsToken}`,
    name: 'CONVERSATION_UPDATE',
    data: conversation,
  });

  response.success(conversation);
}));

/*
 * DELETE
 */

router.delete('/:conversationId', userAuthorize);
router.delete('/:conversationId', conversationAuthorize);
router.delete('/:conversationId', asyncMiddleware(async (request, response) => {
  const { conversation } = request;

  await conversation.destroy();

  events.publish({
    topic: `conversation-${conversation.eventsToken}`,
    name: 'CONVERSATION_DELETE',
    data: { id: conversation.id },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
