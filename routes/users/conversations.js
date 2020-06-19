/*
 * Route: /users/:userId/conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
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
  const accessLevel = (user.id === userId) ? [ 'public', 'protected', 'private' ] : [ 'public', 'protected' ];
  const conversations = await ConversationModel.scope('preview').findAll({
    where: { userId, accessLevel },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(conversations);
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
