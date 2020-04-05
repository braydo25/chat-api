/*
 * Conversation User Association For Matching Routes
 * Must be mounted after conversation associate or authorize.
 * Possible Route Usage: /{any}/conversations/:conversationId/users/:conversationUserId/{any}
 */

const ConversationUserModel = rootRequire('/models/ConversationUserModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { conversation } = request;
  const { conversationUserId } = request.params;
  const conversationUser = await ConversationUserModel.findOne({
    where: {
      id: conversationUserId,
      conversationId: conversation.id,
    },
  });

  if (!conversationUser) {
    return response.respond(404, 'Conversation user not found.');
  }

  request.conversationUser = conversationUser;

  next();
});
