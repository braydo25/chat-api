/*
 * Route: /conversations/:conversationId/users/:conversationUserId?
 */

const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationUserAssociate = rootRequire('/middlewares/conversations/users/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userConversationPermissions = rootRequire('/middlewares/users/conversations/permissions');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', conversationAssociate);
router.get('/', userConversationPermissions({ private: [ 'CONVERSATION_USERS_READ' ] }));
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
router.put('/', userConversationPermissions({ private: [ 'CONVERSATION_USERS_CREATE' ] }));
router.put('/', asyncMiddleware(async (request, response) => {
  const { conversation } = request;
  const { userId } = request.body;
  const data = {
    userId,
    conversationId: conversation.id,
  };

  if (conversation.accessLevel === 'private') {
    throw new Error('Please create a new conversation to add users to a private conversation.');
  }

  if (!userId) {
    throw new Error('A user must be provided.');
  }

  let conversationUser = await ConversationUserModel.findOne({ where: data });

  if (!conversationUser) {
    data.permissions = [
      'CONVERSATION_MESSAGES_READ',
      'CONVERSATION_MESSAGE_REACTIONS_CREATE',
      'CONVERSATION_MESSAGE_REACTIONS_READ',
      'CONVERSATION_USERS_READ',
      ...((conversation.accessLevel !== 'protected') ? [
        'CONVERSATION_MESSAGES_CREATE',
        'CONVERSATION_USERS_CREATE',
      ] : []),
    ];

    conversationUser = await ConversationUserModel.create(data);
  }

  response.success(conversationUser);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', conversationAssociate);
router.patch('/', conversationUserAssociate);
router.patch('/', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_USERS_UPDATE' ] }));
router.patch('/', asyncMiddleware(async (request, response) => {
  const { conversationUser } = request;

  conversationUser.permissions = request.body.permissions || conversationUser.permissions;

  await conversationUser.save();

  response.success(conversationUser);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationUserAssociate);
router.delete('/', userConversationPermissions({ anyAccessLevel: [ 'CONVERSATION_USERS_DELETE' ] }));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversationUser } = request;

  await conversationUser.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
