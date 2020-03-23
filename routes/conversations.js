/*
 * Route: /conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const conversationAuthorize = rootRequire('/middlewares/conversations/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request.user;
  const conversations = await ConversationModel.findAll({
    include: [ ConversationMessageModel, UserModel ],
    where: { userId: user.id },
  });

  response.success(conversations);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { permission, conversationMessage } = request.body;

  const transaction = await database.transaction();

  try {
    const conversation = await ConversationModel.create({
      userId: user.id,
      permission,
      conversationMessages: [
        {
          userId: user.id,
          text: conversationMessage.text,
        },
      ],
    }, {
      include: [ ConversationMessageModel ],
      transaction,
    });

    response.success(conversation);
  } catch(error) {
    transaction.rollback();

    throw error;
  }
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', conversationAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { conversation } = request;

  conversation.permission = request.body.permission || conversation.permission;

  await conversation.save();

  response.success(conversation);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const conversation = request;

  await conversation.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
