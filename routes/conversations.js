/*
 * Route: /conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
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
  const { privateUserIds } = request.query;

  if (privateUserIds) {
    const privateConversation = await ConversationModel.findOneWithUsers({
      authUserId: user.id,
      userIds: [ ...new Set([ user.id, ...privateUserIds.map(id => +id) ]) ],
      where: { accessLevel: 'private' },
    });

    return response.success(privateConversation);
  }

  const conversationIds = (await ConversationUserModel.scope('complete').findAll({
    where: { userId: user.id },
  })).map(conversationUser => conversationUser.conversationId);

  const conversations = await ConversationModel.scope('preview').findAll({
    where: { id: conversationIds },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(conversations);
}));

router.get('/:conversationId', userAuthorize);
router.get('/:conversationId', conversationAssociate);
router.get('/:conversationId', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_MESSAGES_READ' ] }));
router.get('/:conversationId', asyncMiddleware(async (request, response) => {
  const { conversation, user } = request;
  const completeConversation = await ConversationModel.scope({ method: [ 'complete', user.id ] }).findOne({
    where: { id: conversation.id },
  });

  response.success(completeConversation);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevel } = request.body;
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
