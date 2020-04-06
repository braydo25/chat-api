/*
 * Conversation Ownership Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/conversations/:conversationId/{any}
 */

const ConversationModel = rootRequire('/models/ConversationModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { conversationId } = request.params;
  const conversation = await ConversationModel.findOne({
    where: {
      id: conversationId,
      userId: user.id,
    },
  });

  if (!conversation) {
    return response.respond(401, 'Insufficient conversation permissions.');
  }

  request.conversation = conversation;

  next();
});
