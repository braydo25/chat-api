/*
 * Room Message Association For Matching Routes
 * Must be mounted after room associate or authorize
 * Possible Route Usage: /{any}/rooms/:roomId/messages/:roomMessageId/{any}
 */

const RoomMessageModel = rootRequire('/models/RoomMessageModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { room } = request;
  const { roomMessageId } = request.params;

  const roomMessage = await RoomMessageModel.findOne({
    where: {
      id: roomMessageId,
      roomId: room.id,
    },
  });

  if (!roomMessage) {
    return response.respond(404, 'Room message not found.');
  }

  request.roomMessage = roomMessage;

  next();
});
