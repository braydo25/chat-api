/*
 * Route: /rooms/:roomId/messages/:roomMessageId/reactions/:roomMessageReactionId?
 */

const RoomMessageReactionModel = rootRequire('/models/RoomMessageReactionModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const roomAssociate = rootRequire('/middlewares/rooms/associate');
const roomMessageAssociate = rootRequire('/middlewares/rooms/messages/associate');
const roomMessageReactionAuthorize = rootRequire('/middlewares/rooms/messages/reactions/authorize');
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
router.get('/', roomMessageAssociate);
router.get('/', userRoomPermissions({ private: [ 'ROOM_MESSAGE_REACTIONS_READ' ] }));
router.get('/', asyncMiddleware(async (request, response) => {
  const { roomMessage } = request;
  const { reaction } = request.query;

  if (!reaction) {
    throw new Error('A reaction must be provided.');
  }

  const roomMessageReactions = await RoomMessageReactionModel.findAll({
    where: {
      roomMessageId: roomMessage.id,
      reaction,
    },
  });

  response.success(roomMessageReactions);
}));

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', roomAssociate);
router.put('/', roomMessageAssociate);
router.put('/', userRoomPermissions({
  anyAccessLevel: [ 'ROOM_MESSAGE_REACTIONS_CREATE' ],
  waiveNonRoomUser: [ 'public', 'protected' ],
}));
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, room, roomMessage, authRoomUser } = request;
  const { reaction } = request.body;
  const data = {
    userId: user.id,
    roomMessageId: roomMessage.id,
    reaction,
  };

  let roomMessageReaction = await RoomMessageReactionModel.findOne({ where: data });

  const transaction = await database.transaction();

  try {
    if (!authRoomUser) {
      await RoomUserModel.create({
        userId: user.id,
        roomId: room.id,
        permissions: [
          'ROOM_MESSAGES_READ',
          'ROOM_MESSAGE_REACTIONS_CREATE',
          'ROOM_MESSAGE_REACTIONS_READ',
          'ROOM_USERS_READ',
          ...((room.accessLevel === 'public') ? [
            'ROOM_MESSAGES_CREATE',
            'ROOM_USERS_CREATE',
          ] : []),
        ],
      }, {
        eventsTopic: room.eventsTopic,
        setDataValues: { user },
        transaction,
      });
    }

    if (!roomMessageReaction) {
      roomMessageReaction = await RoomMessageReactionModel.create(data, {
        eventsTopic: room.eventsTopic,
        transaction,
      });
    }

    await transaction.commit();

    response.success(roomMessageReaction);
  } catch(error) {
    await transaction.rollback();

    throw error;
  }
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomAssociate);
router.delete('/', roomMessageAssociate);
router.delete('/', roomMessageReactionAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { room, roomMessageReaction } = request;

  await roomMessageReaction.destroy({
    eventsTopic: room.eventsTopic,
    setDataValues: { roomId: room.id },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
