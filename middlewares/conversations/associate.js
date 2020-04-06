/*
 * Conversation Association For Matching Routes
 * Possible Route Usage: /{any}/conversations/:conversationId/{any}
 */

const ConversationModel = rootRequire('/models/ConversationModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { conversationId } = request.params;
  const conversation = await ConversationModel.findOne({
    where: { id: conversationId },
  });

  if (!conversation) {
    return response.respond(404, 'Conversation not found.');
  }

  request.conversation = conversation;

  next();
});
