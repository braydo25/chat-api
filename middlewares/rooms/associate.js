/*
 * Room Association For Matching Routes
 * Possible Route Usage: /{any}/:roomId/{any}
 */

const RoomModel = rootRequire('/models/RoomModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { roomId } = request.params;
  const room = await RoomModel.findOne({ where: { id: roomId } });

  if (!room) {
    return response.respond(400, 'This room does not exist.');
  }

  request.room = room;

  next();
});
