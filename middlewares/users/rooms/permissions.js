/*
 * User Room Permissions For Matching Routes
 * Must be mounted after users authorize and room associate or authorize.
 * Possible Route Usage: /{any}/rooms/:converastionId/{any}
 */

const RoomUserModel = rootRequire('/models/RoomUserModel');

module.exports = permissions => {
  return asyncMiddleware(async (request, response, next) => {
    const { user, room } = request;
    const waiveNonRoomUser = permissions.waiveNonRoomUser || [];
    const roomUser = await RoomUserModel.findOne({
      where: {
        userId: user.id,
        roomId: room.id,
      },
    });

    const requiredPermissions = [
      ...((permissions[room.accessLevel]) ? permissions[room.accessLevel] : []),
      ...((permissions.anyAccessLevel) ? permissions.anyAccessLevel : []),
    ];

    if (!roomUser && waiveNonRoomUser.includes(room.accessLevel)) {
      return next();
    }

    if (requiredPermissions.length) {
      const authorized = (roomUser) ? requiredPermissions.every(requiredPermission => {
        return roomUser.permissions.includes(requiredPermission) ||
               roomUser.permissions.includes('ROOM_ADMIN');
      }) : false;

      if (!authorized) {
        return response.respond(403, 'Insufficient room permissions.');
      }
    }

    request.authRoomUser = roomUser;

    next();
  });
};
