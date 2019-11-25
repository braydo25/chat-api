/*
 * Room Permissions Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /rooms/:roomId/{any}
 */

const RoomModel = rootRequire('/models/RoomModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');

module.exports = allowedPermissions => {
  return asyncMiddleware(async(request, response, next) => {
    const { user } = request;
    const { roomId } = request.params;
    const room = await RoomModel.findOne({ where: { id: roomId } });
    const roomUser = await RoomUserModel.findOne({
      where: {
        roomId: room.id,
        userId: user.id,
      },
    });

    if (!roomUser || !roomUser.permissions.some(permission => allowedPermissions.includes(permission))) {
      return response.respond(401, 'Insufficient permissions.');
    }

    request.room = room;
    request.roomUser = roomUser;

    next();
  });
};
