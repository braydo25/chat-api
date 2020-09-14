/*
 * Route: /rooms/:roomId/messages/:roomMessageId?
 */

const RoomMessageModel = rootRequire('/models/RoomMessageModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const roomAssociate = rootRequire('/middlewares/rooms/associate');
const roomMessageAuthorize = rootRequire('/middlewares/rooms/messages/authorize');
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
router.get('/', userRoomPermissions({ private: [ 'ROOM_MESSAGES_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { room, user } = request;
  const { before, after } = request.query;
  const where = { roomId: room.id };

  if (before) {
    where.createdAt = { [Sequelize.Op.lt]: new Date(before) };
  }

  if (after) {
    where.createdAt = { [Sequelize.Op.gt]: new Date(after) };
  }

  const roomMessages = await RoomMessageModel.scope([
    'defaultScope',
    'withReactions',
    { method: [ 'withAuthUserReactions', user.id ] },
  ]).findAll({
    where,
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(roomMessages);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', roomAssociate);
router.post('/', userRoomPermissions({
  anyAccessLevel: [ 'ROOM_MESSAGES_CREATE' ],
  waiveNonRoomUser: [ 'public' ],
}));
router.post('/', asyncMiddleware(async (request, response) => {
  let authRoomUser = request.authRoomUser;
  const { user, room } = request;
  const { nonce, text, attachmentIds, embedIds } = request.body;

  let roomMessage = (authRoomUser) ? await RoomMessageModel.findOne({
    where: {
      roomId: room.id,
      roomUserId: authRoomUser.id,
      nonce,
    },
  }) : null;

  if (!roomMessage) {
    const transaction = await database.transaction();

    try {
      if (!authRoomUser) {
        authRoomUser = await RoomUserModel.create({
          userId: user.id,
          roomId: room.id,
          permissions: [
            'ROOM_MESSAGES_CREATE',
            'ROOM_MESSAGES_READ',
            'ROOM_MESSAGE_REACTIONS_CREATE',
            'ROOM_MESSAGE_REACTIONS_READ',
            'ROOM_USERS_CREATE',
            'ROOM_USERS_READ',
          ],
        }, {
          eventsTopic: room.eventsTopic,
          setDataValues: { user },
          transaction,
        });
      }

      roomMessage = await RoomMessageModel.createWithAssociations({
        data: {
          roomId: room.id,
          roomUserId: authRoomUser.id,
          nonce,
          text,
        },
        eventsTopic: room.eventsTopic,
        roomUser: authRoomUser,
        attachmentIds,
        embedIds,
        transaction,
      });

      await room.update({
        previewRoomMessageId: roomMessage.id,
        lastMessageAt: new Date,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      throw error;
    }

    room.sendNotificationToRoomUsers({
      sendingUserId: user.id,
      title: room.title,
      message: (text) ? `${user.name}: ${text}` : `${user.name} sent an attachment(s).`,
      data: { roomId: room.id },
    });
  }

  response.success(roomMessage);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', roomAssociate);
router.patch('/', roomMessageAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { room, roomMessage } = request;

  await roomMessage.update({
    text: request.body.text || roomMessage.text,
  }, {
    eventsTopic: room.eventsTopic,
  });

  response.success(roomMessage);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomAssociate);
router.delete('/', roomMessageAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { room, roomMessage } = request;

  await roomMessage.destroy({
    eventsTopic: room.eventsTopic,
    setDataValues: { roomId: room.id },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
