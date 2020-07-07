/*
 * Route: /users/:userId/conversations/:conversationId/data
 */

const UserConversationDataModel = rootRequire('/models/UserConversationDataModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, conversation } = request;

  let userConversationData = await UserConversationDataModel.findOne({
    where: {
      conversationId: conversation.id,
      userId: user.id,
    },
  });

  if (userConversationData) {
    await userConversationData.update({ lastReadAt: new Date() });
  } else {
    userConversationData = await UserConversationDataModel.create({
      userId: user.id,
      conversationId: conversation.id,
      lastReadAt: new Date(),
    });
  }

  response.success(userConversationData);
}));

/*
 * Export
 */

module.exports = router;
