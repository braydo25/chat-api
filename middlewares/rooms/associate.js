/*
 * Room Association For Matching Routes
 * Possible Route Usage: /{any}/rooms/:roomId/{any}
 */

const RoomModel = rootRequire('/models/RoomModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { roomId } = request.params;

  const room = await RoomModel.findOne({
    where: { id: roomId },
  });

  if (!room) {
    return response.respond(404, 'Room not found.');
  }

  request.room = room;

  next();
});
