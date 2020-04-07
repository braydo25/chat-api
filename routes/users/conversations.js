/*
 * Route: /users/:userId/conversations
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
  const permission = (user.id === userId) ? [ 'public', 'private' ] : 'public';
  const conversations = await ConversationModel.findAll({
    where: { userId, permission },
  });

  response.success(conversations);
}));

/*
 * Export
 */

module.exports = router;
