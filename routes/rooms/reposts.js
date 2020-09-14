/*
 * Route: /rooms/:roomId/reposts
 */

const RoomRepostModel = rootRequire('/models/RoomRepostModel');
const UserActivityModel = rootRequire('/models/UserActivityModel');
const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const UserModel = rootRequire('/models/UserModel');
const roomAssociate = rootRequire('/middlewares/rooms/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', roomAssociate);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, room } = request;

  if (room.accessLevel === 'private') {
    throw new Error('Private rooms cannot be reposted.');
  }

  if (user.id === room.userId) {
    throw new Error('You cannot repost your own rooms.');
  }

  let roomRepost = await RoomRepostModel.findOne({
    where: {
      userId: user.id,
      roomId: room.id,
    },
    paranoid: false,
  });

  if (!roomRepost) {
    const transaction = await database.transaction();

    try {
      roomRepost = await RoomRepostModel.create({
        userId: user.id,
        roomId: room.id,
      }, {
        eventsTopic: room.eventsTopic,
        setDataValues: { room, user },
        transaction,
      });

      const eventsTopic = await UserModel.getEventsTopic(room.userId);

      await UserActivityModel.create({
        userId: room.userId,
        roomRepostId: roomRepost.id,
      }, {
        eventsTopic,
        setDataValues: { roomRepost },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      throw error;
    }

    UserDeviceModel.sendPushNotificationForUserId({
      userId: room.userId,
      title: 'Your room was reposted.',
      message: `${user.name} (@${user.username}) reposted your room "${room.title}" with all their followers.`,
    });
  } else {
    await roomRepost.restore();
  }

  response.success(roomRepost);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomAssociate);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { user, room } = request;
  const roomRepost = await RoomRepostModel.findOne({
    where: {
      roomId: room.id,
      userId: user.id,
    },
  });

  if (!roomRepost) {
    throw new Error('There is no active repost by you for this room.');
  }

  await roomRepost.destroy({
    eventsTopic: room.eventsTopic,
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
