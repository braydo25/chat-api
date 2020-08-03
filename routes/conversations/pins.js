/*
 * Route: /conversations/:conversationId/pins/:conversationMessageId
 */

const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAssociate = rootRequire('/middlewares/conversations/messages/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userConversationPermissions = rootRequire('/middlewares/users/conversations/permissions');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', conversationMessageAssociate);
router.put('/', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_MESSAGE_PINS_CREATE' ] }));
router.put('/', asyncMiddleware(async (request, response) => {
  const { conversationMessage } = request;

  await conversationMessage.update({ pinnedAt: new Date() });

  response.success(conversationMessage);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationMessageAssociate);
router.delete('/', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_MESSAGE_PINS_DELETE' ] }));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversationMessage } = request;

  await conversationMessage.update({ pinnedAt: null });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
