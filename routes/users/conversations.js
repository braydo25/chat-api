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
    userId,
    options: {
      where: { userId: user.id },
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

  await ConversationUserModel.destroy({
    where: {
      conversationId,
      userId: user.id,
    },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
