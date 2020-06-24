/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId?
 */

const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAuthorize = rootRequire('/middlewares/conversations/messages/authorize');
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
router.get('/', conversationAssociate);
router.get('/', userConversationPermissions({ private: [ 'CONVERSATION_MESSAGES_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { conversation, user } = request;
  const conversationMessages = await ConversationMessageModel.scope([
    'defaultScope',
    'withReactions',
    { method: [ 'withAuthUserReactions', user.id ] },
  ]).findAll({
    where: { conversationId: conversation.id },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(conversationMessages);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', conversationAssociate);
router.post('/', userConversationPermissions({
  anyAccessLevel: [ 'CONVERSATION_MESSAGES_CREATE' ],
  waiveNonConversationUser: [ 'public' ],
}));
router.post('/', asyncMiddleware(async (request, response) => {
  const { user, conversation, authConversationUser } = request;
  const { nonce, text, attachmentIds, embedIds } = request.body;

  const transaction = await database.transaction();

  try {
    if (!authConversationUser) {
      await ConversationUserModel.create({
        userId: user.id,
        conversationId: conversation.id,
        permissions: [
          'CONVERSATION_MESSAGES_CREATE',
          'CONVERSATION_MESSAGES_READ',
          'CONVERSATION_MESSAGE_REACTIONS_CREATE',
          'CONVERSATION_MESSAGE_REACTIONS_READ',
          'CONVERSATION_USERS_CREATE',
          'CONVERSATION_USERS_READ',
        ],
      }, { transaction });
    }

    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        userId: user.id,
        conversationId: conversation.id,
        nonce,
        text,
      },
      attachmentIds,
      embedIds,
      transaction,
    });

    conversation.previewConversationMessageId = conversationMessage.id;

    await conversation.save({ transaction });

    await transaction.commit();

    events.publish({
      topic: `conversation-${conversation.eventsToken}`,
      name: 'CONVERSATION_MESSAGE_CREATE',
      data: conversationMessage,
    });

    response.success(conversationMessage);
  } catch(error) {
    await transaction.rollback();

    throw error;
  }
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', conversationAssociate);
router.patch('/', conversationMessageAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { conversation, conversationMessage } = request;

  conversationMessage.text = request.body.text || conversationMessage.text;

  await conversationMessage.save();

  events.publish({
    topic: `conversation-${conversation.eventsToken}`,
    name: 'CONVERSATION_MESSAGE_UPDATE',
    data: conversationMessage,
  });

  response.success(conversationMessage);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationMessageAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversation, conversationMessage } = request;

  await conversationMessage.destroy();

  events.publish({
    topic: `conversation-${conversation.eventsToken}`,
    name: 'CONVERSATION_MESSAGE_DELETE',
    data: {
      id: conversationMessage.id,
      conversationId: conversation.id,
    },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
