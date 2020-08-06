/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId/reactions/:conversationMessageReactionId?
 */

const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAssociate = rootRequire('/middlewares/conversations/messages/associate');
const conversationMessageReactionAuthorize = rootRequire('/middlewares/conversations/messages/reactions/authorize');
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
router.get('/', conversationMessageAssociate);
router.get('/', userConversationPermissions({ private: [ 'CONVERSATION_MESSAGE_REACTIONS_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { conversationMessage } = request;
  const { reaction } = request.query;

  if (!reaction) {
    throw new Error('A reaction must be provided.');
  }

  const conversationMessageReactions = await ConversationMessageReactionModel.findAll({
    where: {
      conversationMessageId: conversationMessage.id,
      reaction,
    },
  });

  response.success(conversationMessageReactions);
}));

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', conversationMessageAssociate);
router.put('/', userConversationPermissions({
  anyAccessLevel: [ 'CONVERSATION_MESSAGE_REACTIONS_CREATE' ],
  waiveNonConversationUser: [ 'public', 'protected' ],
}));
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, conversation, conversationMessage, authConversationUser } = request;
  const { reaction } = request.body;
  const data = {
    conversationMessageId: conversationMessage.id,
    conversationUserId: authConversationUser.userId,
    reaction,
  };

  let conversationMessageReaction = await ConversationMessageReactionModel.findOne({ where: data });

  const transaction = await database.transaction();

  try {
    if (!authConversationUser) {
      await ConversationUserModel.create({
        userId: user.id,
        conversationId: conversation.id,
        permissions: [
          'CONVERSATION_MESSAGES_READ',
          'CONVERSATION_MESSAGE_REACTIONS_CREATE',
          'CONVERSATION_MESSAGE_REACTIONS_READ',
          'CONVERSATION_USERS_READ',
          ...((conversation.accessLevel === 'public') ? [
            'CONVERSATION_MESSAGES_CREATE',
            'CONVERSATION_USERS_CREATE',
          ] : []),
        ],
      }, {
        eventsTopic: conversation.eventsTopic,
        setDataValues: { user },
        transaction,
      });
    }

    if (!conversationMessageReaction) {
      conversationMessageReaction = await ConversationMessageReactionModel.create(data, {
        eventsTopic: conversation.eventsTopic,
        transaction,
      });
    }

    await transaction.commit();

    response.success(conversationMessageReaction);
  } catch(error) {
    await transaction.rollback();

    throw error;
  }
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationMessageAssociate);
router.delete('/', conversationMessageReactionAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversation, conversationMessageReaction } = request;

  await conversationMessageReaction.destroy({
    eventsTopic: conversation.eventsTopic,
    setDataValues: { conversationId: conversation.id },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
