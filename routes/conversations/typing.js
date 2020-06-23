/*
 * Route: /conversations/:conversationId/typing
 */

const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userConversationPermissions = rootRequire('/middlewares/users/conversations/permissions');
const events = rootRequire('/libs/events');

const router = express.Router({
  mergeParams: true,
});

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', conversationAssociate);
router.post('/', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_MESSAGES_CREATE' ] }));
router.post('/', asyncMiddleware(async (request, response) => {
  const { user, conversation } = request;

  events.publish({
    topic: `conversation-${conversation.eventsToken}`,
    name: 'CONVERSATION_MESSAGE_TYPING_START',
    data: {
      user: {
        id: user.id,
        name: user.name,
      },
    },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
