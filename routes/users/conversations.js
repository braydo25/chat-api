/*
 * Route: /users/:userId/conversations
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { userId } = request.params;
  const conversations = await ConversationModel.findAll({
    include: [
      {
        model: ConversationMessageModel,
        include: [ AttachmentModel, EmbedModel ],
      },
      {
        model: ConversationUserModel,
        include: [ UserModel ],
      },
      UserModel,
    ],
    where: { userId },
  });

  response.success(conversations);
}));

/*
 * Export
 */

module.exports = router;
