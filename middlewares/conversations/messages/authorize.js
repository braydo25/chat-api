/*
 * Conversation Message Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/messages/:conversationMessageId/{any}
 */

const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { conversationMessageId } = request.params;
  const conversationMessage = await ConversationMessageModel.findOne({
    where: { id: conversationMessageId, userId: user.id },
  });

  if (!conversationMessage) {
    return response.respond(401, 'Insufficient message permissions.');
  }

  request.conversationMessage = conversationMessage;

  next();
});
