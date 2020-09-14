/*
 * Room Message Reaction Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/reactions/:roomMessageReactionId/{any}
 */

const RoomMessageReactionModel = rootRequire('/models/RoomMessageReactionModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { roomMessageReactionId } = request.params;

  const roomMessageReaction = await RoomMessageReactionModel.findOne({
    where: {
      id: roomMessageReactionId,
      userId: user.id,
    },
  });

  if (!roomMessageReaction) {
    return response.respond(403, 'Insufficient room message reaction permissions');
  }

  request.roomMessageReaction = roomMessageReaction;

  next();
});
