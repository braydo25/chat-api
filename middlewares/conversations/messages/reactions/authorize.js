/*
 * Conversation Message Reaction Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/reactions/:conversationMessageReactionId/{any}
 */

const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { conversationMessageReactionId } = request.params;

  const conversationMessageReaction = await ConversationMessageReactionModel.findOne({
    include: [
      {
        attributes: [],
        model: ConversationUserModel.unscoped(),
        where: { userId: user.id },
        required: true,
      },
    ],
    where: { id: conversationMessageReactionId },
  });

  if (!conversationMessageReaction) {
    return response.respond(403, 'Insufficient conversation message reaction permissions');
  }

  request.conversationMessageReaction = conversationMessageReaction;

  next();
});
