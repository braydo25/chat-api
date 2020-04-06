/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId/reactions/:conversationMessageReactionId?
 */

const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAssociate = rootRequire('/middlewares/conversations/messages/associate');
const conversationMessageReactionAuthorize = rootRequire('/middlewares/conversations/messages/reactions/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', conversationMessageAssociate);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, conversationMessage } = request;
  const { reaction } = request.body;
  const data = {
    userId: user.id,
    conversationMessageId: conversationMessage.id,
    reaction,
  };

  let conversationMessageReaction = await ConversationMessageReactionModel.findOne({ where: data });

  if (!conversationMessageReaction) {
    conversationMessageReaction = await ConversationMessageReactionModel.create(data);
  }

  response.success(conversationMessageReaction);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationMessageReactionAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversationMessageReaction } = request;

  await conversationMessageReaction.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
