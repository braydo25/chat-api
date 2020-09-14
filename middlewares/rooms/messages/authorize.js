/*
 * Room Message Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/messages/:roomMessageId/{any}
 */

const RoomMessageModel = rootRequire('/models/RoomMessageModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { roomMessageId } = request.params;

  const roomMessage = await RoomMessageModel.findOne({
    include: [
      {
        model: RoomUserModel,
        where: { userId: user.id },
        required: true,
      },
    ],
    where: { id: roomMessageId },
  });

  if (!roomMessage) {
    return response.respond(403, 'Insufficient room message permissions.');
  }

  request.roomMessage = roomMessage;

  next();
});
