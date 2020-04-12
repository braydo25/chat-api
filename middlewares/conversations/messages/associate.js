/*
 * Conversation Message Association For Matching Routes
 * Must be mounted after conversation associate or authorize
 * Possible Route Usage: /{any}/conversations/:conversationId/messages/:conversationMessageId/{any}
 */

const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { conversation } = request;
  const { conversationMessageId } = request.params;

  const conversationMessage = await ConversationMessageModel.findOne({
    where: {
      id: conversationMessageId,
      conversationId: conversation.id,
    },
  });

  if (!conversationMessage) {
    return response.respond(404, 'Conversation message not found.');
  }

  request.conversationMessage = conversationMessage;

  next();
});
