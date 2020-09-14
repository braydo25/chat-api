/*
 * Room Ownership Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/rooms/:roomId/{any}
 */

const RoomModel = rootRequire('/models/RoomModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { roomId } = request.params;

  const room = await RoomModel.findOne({
    where: {
      id: roomId,
      userId: user.id,
    },
  });

  if (!room) {
    return response.respond(403, 'Insufficient room permissions.');
  }

  request.room = room;

  next();
});
