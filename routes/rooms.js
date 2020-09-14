/*
 * Route: /rooms/:roomId?
 */

const RoomModel = rootRequire('/models/RoomModel');
const RoomImpressionModel = rootRequire('/models/RoomImpressionModel');
const UserModel = rootRequire('/models/UserModel');
const roomAssociate = rootRequire('/middlewares/rooms/associate');
const roomAuthorize = rootRequire('/middlewares/rooms/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userRoomPermissions = rootRequire('/middlewares/users/rooms/permissions');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevels, feed, privateUserIds, privatePhones, before, after, staler, fresher, search, limit } = request.query;
  const where = {};

  if (before) {
    where.createdAt = { [Sequelize.Op.lt]: new Date(before) };
  }

  if (after) {
    where.createdAt = { [Sequelize.Op.gt]: new Date(after) };
  }

  if (staler) {
    where.lastMessageAt = { [Sequelize.Op.lt]: new Date(staler) };
  }

  if (fresher) {
    where.lastMessageAt = { [Sequelize.Op.gt]: new Date(fresher) };
  }

  if (search) {
    where.title = { [Sequelize.Op.like]: `%${search}%` };
  }

  if (accessLevels) {
    const rooms = await RoomModel.findAllWithUser({
      authUserId: user.id,
      where: {
        accessLevel: accessLevels,
        ...where,
      },
      order: [ [ 'lastMessageAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? limit : 5,
    });

    return response.success(rooms);
  }

  if (feed) {
    const rooms = await RoomModel.findAllByFollowedUsers({
      authUserId: user.id,
      where,
      order: [ [ 'createdAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? limit : 5,
    });

    return response.success(rooms);
  }

  if (privateUserIds || privatePhones) {
    const privatePhoneUserIds = [];

    if (Array.isArray(privatePhones)) {
      const privatePhoneUsers = await UserModel.unscoped().findAll({
        attributes: [ 'id' ],
        where: { phone: privatePhones },
      });

      if (privatePhoneUsers.length !== privatePhones.length) {
        return response.success();
      }

      privatePhoneUsers.forEach(privatePhoneUser => {
        privatePhoneUserIds.push(privatePhoneUser.id);
      });
    }

    const privateRoom = await RoomModel.findOneWithUsers({
      authUserId: user.id,
      userIds: [ ...new Set([
        user.id,
        ...((privateUserIds) ? privateUserIds.map(id => +id) : []),
        ...privatePhoneUserIds,
      ]) ],

      where: {
        accessLevel: 'private',
        ...where,
      },
    });

    return response.success(privateRoom);
  }

  if (search) {
    const searchRooms = await RoomModel.scope({ method: [ 'preview', user.id ] }).findAll({
      where: {
        accessLevel: [ 'public', 'protected' ],
        ...where,
      },
      order: [ [ 'lastMessageAt', 'DESC' ] ],
      limit: (limit && limit < 25) ? Math.floor(limit / 2) : 10,
    });

    // TODO: support searching private convos, either by users in them or content?

    return response.success(searchRooms);
  }

  const relevantRooms = await RoomModel.findAllRelevantRoomsForUser({
    authUserId: user.id,
    where,
    order: [ [ 'lastMessageAt', 'DESC' ] ],
    limit: (limit && limit < 25) ? limit : 10,
  });

  response.success(relevantRooms);
}));

router.get('/:roomId', userAuthorize);
router.get('/:roomId', roomAssociate);
router.get('/:roomId', userRoomPermissions({
  anyAccessLevel: [ 'ROOM_MESSAGES_READ' ],
  waiveNonRoomUser: [ 'public', 'protected' ],
}));
router.get('/:roomId', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { preview } = request.query;
  const roomType = (preview) ? 'preview' : 'complete';

  const room = await RoomModel.scope({ method: [ roomType, user.id ] }).findOne({
    where: { id: request.room.id },
  });

  if (!preview) {
    RoomImpressionModel.create({
      userId: user.id,
      roomId: room.id,
    });
  }

  response.success(room);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { accessLevel, title, phoneUsers } = request.body;
  const userIds = request.body.userIds || [];
  const message = request.body.message || {};

  if (Array.isArray(phoneUsers)) {
    const phoneUserPhones = phoneUsers.map(phoneUser => phoneUser.phone);
    const existingUsers = await UserModel.unscoped().findAll({
      attributes: [ 'id', 'phone', 'username' ],
      where: { phone: phoneUserPhones },
    });

    for (let i = 0; i < phoneUsers.length; i++) {
      const phoneUser = phoneUsers[i];
      const inviteMessage = `${user.name} sent you a message on Babble! To start chatting with them, get the Babble app: https://www.usebabble.com/`;
      const existingUser = existingUsers.find(existingUser => existingUser.phone === phoneUser.phone);

      if (existingUser) {
        if (!existingUser.username) {
          existingUser.sendInviteTextMessage(inviteMessage);
        }

        userIds.push(existingUser.id);
      } else {
        const newUser = await UserModel.createWithInvite({
          name: phoneUser.name,
          phone: phoneUser.phone,
          inviteMessage,
        });

        userIds.push(newUser.id);
      }
    }
  }

  if (accessLevel === 'private') {
    const existingRoom = await RoomModel.findOneWithUsers({
      authUserId: user.id,
      userIds: [ ...new Set([
        user.id,
        ...userIds.map(userId => +userId),
      ]) ],
      where: { accessLevel: 'private' },
    });

    if (existingRoom) {
      return response.respond(409, existingRoom);
    }
  }

  const room = await RoomModel.createWithAssociations({
    data: {
      userId: user.id,
      accessLevel,
      title,
    },
    userIds,
    message,
  });

  room.sendNotificationToRoomUsers({
    sendingUserId: user.id,
    title: room.title || 'New Room',
    message: (message.text) ? `${user.name}: ${message.text}` : `${user.name}: sent an attachment(s).`,
    data: { roomId: room.id },
  });

  response.success(room);
}));

/*
 * PATCH
 */

router.patch('/:roomId', userAuthorize);
router.patch('/:roomId', roomAuthorize);
router.patch('/:roomId', asyncMiddleware(async (request, response) => {
  const { room } = request;

  await room.update({
    accessLevel: request.body.accessLevel || room.accessLevel,
    title: (request.body.title !== undefined) ? request.body.title : room.title,
  });

  response.success(room);
}));

/*
 * DELETE
 */

router.delete('/:roomId', userAuthorize);
router.delete('/:roomId', roomAuthorize);
router.delete('/:roomId', asyncMiddleware(async (request, response) => {
  const { room } = request;

  await room.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
