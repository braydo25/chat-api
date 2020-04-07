/*
 * Route: /conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const conversationAuthorize = rootRequire('/middlewares/conversations/authorize');
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

  const conversationIds = (await ConversationUserModel.scope('complete').findAll({
    where: { userId: user.id },
  })).map(conversationUser => conversationUser.conversationId);

  const conversations = await ConversationModel.findAll({
    where: { id: conversationIds },
  });

  response.success(conversations);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { permission } = request.body;
  const message = request.body.message || {};
  const attachments = (Array.isArray(message.attachments)) ? message.attachments : [];
  const embeds = (Array.isArray(message.embeds)) ? message.embeds : [];
  const users = (Array.isArray(request.body.users)) ? request.body.users : [];

  const transaction = await database.transaction();

  try {
    const conversation = await ConversationModel.createWithAssociations({
      data: {
        userId: user.id,
        permission,
      },
      userIds: users,
      transaction,
    });

    const conversationMessage = await ConversationMessageModel.createWithAssociations({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        text: message.text,
      },
      attachmentIds: attachments,
      embedIds: embeds,
      transaction,
    });

    await transaction.commit();

    response.success({
      ...conversation.toJSON(),
      conversationMessages: [ conversationMessage.toJSON() ],
    });
  } catch(error) {
    await transaction.rollback();

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
  const { conversation } = request;

  await conversation.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
