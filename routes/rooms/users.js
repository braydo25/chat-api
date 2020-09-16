/*
 * Route: /rooms/:roomId/users/:roomUserId?
 */

const RoomUserModel = rootRequire('/models/RoomUserModel');
const UserModel = rootRequire('/models/UserModel');
const roomAssociate = rootRequire('/middlewares/rooms/associate');
const roomUserAssociate = rootRequire('/middlewares/rooms/users/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userRoomPermissions = rootRequire('/middlewares/users/rooms/permissions');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', roomAssociate);
router.get('/', userRoomPermissions({ private: [ 'ROOM_USERS_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { room } = request;
  const roomUsers = await RoomUserModel.findAll({
    where: { roomId: room.id },
    limit: 5,
  });

  response.success(roomUsers);
}));

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', roomAssociate);
router.put('/', userRoomPermissions({ private: [ 'ROOM_USERS_CREATE' ] }));
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, room } = request;
  const { userId, phoneUser } = request.body;
  const data = {
    userId,
    roomId: room.id,
  };

  if (room.accessLevel === 'private' && room.usersCount <= 2) {
    throw new Error('Please create a new private group room. Users cannot be invited to private direct messages.');
  }

  if (!userId && !phoneUser) {
    throw new Error('A user must be provided.');
  }

  let invitedUser = null;

  if (phoneUser) {
    const inviteMessage = `${user.name} invited you to join a room on Babble! To start chatting, get the Babble app: https://www.usebabble.com/`;

    invitedUser = await UserModel.findOne({
      where: { phone: phoneUser.phone },
    });

    if (!invitedUser) {
      invitedUser = await UserModel.createWithInvite({
        name: phoneUser.name,
        phone: phoneUser.phone,
        inviteMessage,
      });
    } else if (!invitedUser.username) {
      invitedUser.sendInviteTextMessage(inviteMessage);
    }

    data.userId = invitedUser.id;
  } else {
    invitedUser = await UserModel.findOne({
      where: { id: userId },
    });
  }

  if (!invitedUser) {
    throw new Error('Invited user does not exist.');
  }

  let roomUser = await RoomUserModel.findOne({ where: data });

  if (!roomUser) {
    data.permissions = [
      'ROOM_MESSAGES_READ',
      'ROOM_MESSAGE_REACTIONS_CREATE',
      'ROOM_MESSAGE_REACTIONS_READ',
      'ROOM_USERS_READ',
      'ROOM_MESSAGES_CREATE',
      'ROOM_USERS_CREATE',
    ];

    roomUser = await RoomUserModel.create(data, {
      eventsTopic: room.eventsTopic,
      setDataValues: { user: invitedUser },
    });
  }

  response.success(roomUser);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', roomAssociate);
router.patch('/', roomUserAssociate);
router.patch('/', userRoomPermissions({ anyAccessLevel: [ 'ROOM_USERS_UPDATE' ] }));
router.patch('/', asyncMiddleware(async (request, response) => {
  const { room, roomUser } = request;

  await roomUser.update({
    permissions: request.body.permissions || roomUser.permissions,
  }, {
    eventsTopic: room.eventsTopic,
  });

  response.success(roomUser);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomAssociate);
router.delete('/', roomUserAssociate);
router.delete('/', userRoomPermissions({ anyAccessLevel: [ 'ROOM_USERS_DELETE' ] }));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { room, roomUser } = request;

  await roomUser.destroy({
    eventsTopic: room.eventsTopic,
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
