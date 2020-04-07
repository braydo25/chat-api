/*
 * Route: /conversations/:conversationId/users/:conversationUserId?
 */

const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationUserAssociate = rootRequire('/middlewares/conversations/users/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');

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
  const conversationUsers = await ConversationUserModel.findAll({
    where: { conversationId: conversation.id },
  });

  response.success(conversationUsers);
}));

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', asyncMiddleware(async (request, response) => {
  const { conversation } = request;
  const { userId } = request.body;
  const data = {
    conversationId: conversation.id,
    userId,
  };

  if (!userId) {
    throw new Error('A user must be provided.');
  }

  let conversationUser = await ConversationUserModel.findOne({ where: data });

  if (!conversationUser) {
    conversationUser = await ConversationUserModel.create(data);
  }

  response.success(conversationUser);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationUserAssociate);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversationUser } = request;

  await conversationUser.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
