/*
 * Route: /conversations/:conversationId/messages/:conversationMessageId?
 */

const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAuthorize = rootRequire('/middlewares/conversations/messages/authorize');
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
router.get('/', userConversationPermissions({ private: [ 'CONVERSATION_MESSAGES_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { conversation, user } = request;
  const conversationMessages = await ConversationMessageModel.scope([
    'defaultScope',
    'withReactions',
    { method: [ 'withAuthUserReactions', user.id ] },
  ]).findAll({
    where: { conversationId: conversation.id },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(conversationMessages);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', conversationAssociate);
router.post('/', userConversationPermissions({
  anyAccessLevel: [ 'CONVERSATION_MESSAGES_CREATE' ],
  waiveNonConversationUser: [ 'public' ],
}));
router.post('/', asyncMiddleware(async (request, response) => {
  let authConversationUser = request.authConversationUser;
  const { user, conversation } = request;
  const { nonce, text, attachmentIds, embedIds } = request.body;

  let conversationMessage = (authConversationUser) ? await ConversationMessageModel.findOne({
    where: {
      conversationId: conversation.id,
      conversationUserId: authConversationUser.id,
      nonce,
    },
  }) : null;

  if (!conversationMessage) {
    const transaction = await database.transaction();

    try {
      if (!authConversationUser) {
        authConversationUser = await ConversationUserModel.create({
          userId: user.id,
          conversationId: conversation.id,
          permissions: [
            'CONVERSATION_MESSAGES_CREATE',
            'CONVERSATION_MESSAGES_READ',
            'CONVERSATION_MESSAGE_REACTIONS_CREATE',
            'CONVERSATION_MESSAGE_REACTIONS_READ',
            'CONVERSATION_USERS_CREATE',
            'CONVERSATION_USERS_READ',
          ],
        }, {
          eventsTopic: conversation.eventsTopic,
          setDataValues: { user },
          transaction,
        });
      }

      conversationMessage = await ConversationMessageModel.createWithAssociations({
        data: {
          conversationId: conversation.id,
          conversationUserId: authConversationUser.id,
          nonce,
          text,
        },
        eventsTopic: conversation.eventsTopic,
        conversationUser: authConversationUser,
        attachmentIds,
        embedIds,
        transaction,
      });

      await conversation.update({
        previewConversationMessageId: conversationMessage.id,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      throw error;
    }

    conversation.sendNotificationToConversationUsers({
      sendingUserId: user.id,
      title: conversation.title,
      message: (text) ? `${user.name}: ${text}` : `${user.name} sent an attachment(s).`,
    });
  }

  response.success(conversationMessage);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', conversationAssociate);
router.patch('/', conversationMessageAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { conversation, conversationMessage } = request;

  await conversationMessage.update({
    text: request.body.text || conversationMessage.text,
  }, {
    eventsTopic: conversation.eventsTopic,
  });

  response.success(conversationMessage);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationMessageAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversation, conversationMessage } = request;

  await conversationMessage.destroy({
    eventsTopic: conversation.eventsTopic,
    setDataValues: { conversationId: conversation.id },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
