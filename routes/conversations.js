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

    return response.success(searchConversations);
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
  const { user } = request;
  const { preview } = request.query;
  const conversationType = (preview) ? 'preview' : 'complete';

  const conversation = await ConversationModel.scope({ method: [ conversationType, user.id ] }).findOne({
    where: { id: request.conversation.id },
  });

  if (!preview) {
    ConversationImpressionModel.create({
      userId: user.id,
      conversationId: conversation.id,
    });
  }

  response.success(conversation);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevel, title, userIds } = request.body;
  const message = request.body.message || {};

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

  const conversation = await ConversationModel.createWithAssociations({
    data: {
      userId: user.id,
      accessLevel,
      title,
    },
    userIds,
    message,
  });

  response.success(conversation);
}));

/*
 * PATCH
 */

router.patch('/:conversationId', userAuthorize);
router.patch('/:conversationId', conversationAuthorize);
router.patch('/:conversationId', asyncMiddleware(async (request, response) => {
  const { conversation } = request;

  await conversation.update({
    accessLevel: request.body.accessLevel || conversation.accessLevel,
    title: (request.body.title !== undefined) ? request.body.title : conversation.title,
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

  response.success();
}));

/*
 * Export
 */

module.exports = router;
