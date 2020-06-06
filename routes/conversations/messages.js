/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId?
 */

const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAuthorize = rootRequire('/middlewares/conversations/messages/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userConversationPermissions = rootRequire('/middlewares/users/conversations/permissions');

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
router.post('/', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_MESSAGES_CREATE' ] }));
router.post('/', asyncMiddleware(async (request, response) => {
  const { user, conversation } = request;
  const { nonce, text, attachments, embeds } = request.body;

  const transaction = await database.transaction();

  try {
    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        userId: user.id,
        conversationId: conversation.id,
        nonce,
        text,
      },
      attachmentIds: attachments,
      embedIds: embeds,
      transaction,
    });

    conversation.previewConversationMessageId = conversationMessage.id;

    await conversation.save({ transaction });

    await transaction.commit();

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
router.patch('/', conversationMessageAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { conversationMessage } = request;

  conversationMessage.text = request.body.text || conversationMessage.text;

  await conversationMessage.save();

  response.success(conversationMessage);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationMessageAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversationMessage } = request;

  await conversationMessage.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
