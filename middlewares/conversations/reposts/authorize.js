/*
 * Conversation Repost Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/reposts/:conversationRepostId/{any}
 */

const ConversationRepostModel = rootRequire('/models/ConversationRepostModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { conversationRepostId } = request.params;

  const conversationRepost = await ConversationRepostModel.findOne({
    where: {
      id: conversationRepostId,
      userId: user.id,
    },
  });

  if (!conversationRepost) {
    return response.respond(403, 'Insufficient conversation repost permissions.');
  }

  request.conversationRepost = conversationRepost;

  next();
});
