/*
 * Route: /conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationImpressionModel = rootRequire('/models/ConversationImpressionModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationAuthorize = rootRequire('/middlewares/conversations/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userConversationPermissions = rootRequire('/middlewares/users/conversations/permissions');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevels, feed, privateUserIds, limit } = request.query;

  if (accessLevels) {
    const conversations = await ConversationModel.findAllWithUser({
      userId: user.id,
      where: { [Sequelize.Op.or]: accessLevels.map(accessLevel => ({ accessLevel })) },
      order: [ [ 'updatedAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? limit : 5,
    });

    return response.success(conversations);
  }

  if (feed) {
    const conversations = await ConversationModel.findAllByFollowedUsers({
      userId: user.id,
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

  const relevantConversations = await ConversationModel.findAllRelevantConversationsForUser({
    userId: user.id,
    order: [ [ 'updatedAt', 'DESC' ] ],
    limit: (limit && limit < 25) ? limit : 5,
  });

  response.success(relevantConversations);
}));

router.get('/:conversationId', userAuthorize);
router.get('/:conversationId', conversationAssociate);
router.get('/:conversationId', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_MESSAGES_READ' ] }));
router.get('/:conversationId', asyncMiddleware(async (request, response) => {
  const { conversation, user } = request;
  const completeConversation = await ConversationModel.scope({ method: [ 'complete', user.id ] }).findOne({
    where: { id: conversation.id },
  });

  const transaction = await database.transaction(); // temporary? at scale consistently locking row will cause bottleneck

  try {
    ConversationImpressionModel.create({
      userId: user.id,
      conversationId: conversation.id,
    }, { transaction });

    conversation.impressionsCount++;

    await conversation.save({ transaction });

    await transaction.commit();

    response.success(completeConversation);
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevel, title } = request.body;
  const message = request.body.message || {};
  const attachments = (Array.isArray(message.attachments)) ? message.attachments : [];
  const embeds = (Array.isArray(message.embeds)) ? message.embeds : [];
  const users = (Array.isArray(request.body.users)) ? request.body.users : [];

  const transaction = await database.transaction();

  if (accessLevel === 'private') {
    const existingConversation = await ConversationModel.findOneWithUsers({
      authUserId: user.id,
      userIds: [ ...new Set([ user.id, ...users.map(id => +id) ]) ],
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
      userIds: users,
      transaction,
    });

    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        text: message.text,
        nonce: message.nonce,
      },
      attachmentIds: attachments,
      embedIds: embeds,
      transaction,
    });

    conversation.previewConversationMessageId = conversationMessage.id;

    await conversation.save({ transaction });

    await transaction.commit();

    response.success({
      ...conversation.toJSON(),
      previewConversationMessage: conversationMessage.toJSON(),
      conversationMessages: [ conversationMessage.toJSON() ],
    });
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
  conversation.title = request.body.title || conversation.title;

  await conversation.save();

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

  response.success();
}));

/*
 * Export
 */

module.exports = router;
