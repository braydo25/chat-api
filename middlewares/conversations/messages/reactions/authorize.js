/*
 * Conversation Message Reaction Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/reactions/:conversationMessageReactionId/{any}
 */

const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { conversationMessageReactionId } = request.params;
  const conversationMessageReaction = await ConversationMessageReactionModel.findOne({
    where: {
      id: conversationMessageReactionId,
      userId: user.id,
    },
  });

  if (!conversationMessageReaction) {
    return response.respond(401, 'Insufficient conversation message reaction permissions');
  }

  request.conversationMessageReaction = conversationMessageReaction;

  next();
});
