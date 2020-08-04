/*
 * Route: /users/:userId/conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationRepostModel = rootRequire('/models/ConversationRepostModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { userId } = request.params;

  const conversationReposts = await ConversationRepostModel.findAllNormalized({
    authUserId: user.id,
    options: {
      where: { userId },
      order: [ [ 'createdAt', 'DESC' ] ],
    },
  });

  const conversations = await ConversationModel.scope({ method: [ 'preview', user.id ] }).findAll({
    where: {
      userId,
      accessLevel: [ 'public', 'protected' ],
    },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success([
    ...conversationReposts,
    ...conversations,
  ]);
}));

/*
 * DELETE
 */

router.delete('/:conversationId', userAuthorize);
router.delete('/:conversationId', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { conversationId } = request.params;
  const conversationEventsTopic = await ConversationModel.getEventsTopic(conversationId);
  const conversationUser = await ConversationUserModel.findOne({
    where: {
      conversationId,
      userId: user.id,
    },
  });

  await conversationUser.destroy({
    eventTopic: conversationEventsTopic,
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
