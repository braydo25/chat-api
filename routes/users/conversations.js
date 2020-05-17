/*
 * Route: /users/:userId/conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
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

router.delete('/', userAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  // TODO: Leave a convo?
  response.success;
}));

/*
 * Export
 */

module.exports = router;
