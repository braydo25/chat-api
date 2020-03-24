/*
 * Route: /conversations/:conversationId/messages/conversationMessageId?
 */

const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAuthorize = rootRequire('/middlewares/conversations/messages/authorize');

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
    include: [ UserModel ],
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
  const { text } = request.body;

  const conversationMessage = await ConversationMessageModel.create({
    userId: user.id,
    conversationId: conversation.id,
    text,
  });

  response.success(conversationMessage);
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
