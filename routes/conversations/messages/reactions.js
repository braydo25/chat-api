/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId/reactions/:conversationMessageReactionId?
 */

const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAssociate = rootRequire('/middlewares/conversations/messages/associate');
const conversationMessageReactionAuthorize = rootRequire('/middlewares/conversations/messages/reactions/authorize');
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
router.get('/', conversationMessageAssociate);
router.get('/', userConversationPermissions({ private: [ 'CONVERSATION_MESSAGE_REACTIONS_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { conversationMessage } = request;
  const { reaction } = request.query;

  if (!reaction) {
    throw new Error('A reaction must be provided.');
  }

  const conversationMessageReactions = await ConversationMessageReactionModel.findAll({
    where: {
      conversationMessageId: conversationMessage.id,
      reaction,
    },
  });

  response.success(conversationMessageReactions);
}));

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', conversationMessageAssociate);
router.put('/', userConversationPermissions({ private: [ 'CONVERSATION_MESSAGE_REACTIONS_WRITE' ] }));
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
