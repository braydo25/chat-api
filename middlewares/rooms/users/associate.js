/*
 * Room User Association For Matching Routes
 * Must be mounted after room associate or authorize.
 * Possible Route Usage: /{any}/rooms/:roomId/users/:roomUserId/{any}
 */

const RoomUserModel = rootRequire('/models/RoomUserModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { room } = request;
  const { roomUserId } = request.params;

  const roomUser = await RoomUserModel.findOne({
    where: {
      id: roomUserId,
      roomId: room.id,
    },
  });

  if (!roomUser) {
    return response.respond(404, 'Room user not found.');
  }

  request.roomUser = roomUser;

  next();
});
