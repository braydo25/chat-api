/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId?
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserModel = rootRequire('/models/UserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAuthorize = rootRequire('/middlewares/conversations/messages/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', conversationAssociate);
router.get('/', asyncMiddleware(async (request, response) => {
  const { conversation } = request;
  const conversationMessages = await ConversationMessageModel.findAll({
    include: [ AttachmentModel, EmbedModel, UserModel ],
    where: { conversationId: conversation.id },
  });

  response.success(conversationMessages);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', conversationAssociate);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user, conversation } = request;
  const { text, attachments, embeds } = request.body;

  const transaction = await database.transaction();

  try {
    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        userId: user.id,
        conversationId: conversation.id,
        text,
      },
      attachmentIds: attachments,
      embedIds: embeds,
      transaction,
    });

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
