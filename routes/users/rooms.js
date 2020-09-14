/*
 * Route: /users/:userId/rooms/:roomId?
 */

const RoomModel = rootRequire('/models/RoomModel');
const RoomRepostModel = rootRequire('/models/RoomRepostModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { userId } = request.params;
  const { before, after, limit } = request.query;
  const where = {};

  if (before) {
    where.createdAt = { [Sequelize.Op.lt]: new Date(before) };
  }

  if (after) {
    where.createdAt = { [Sequelize.Op.gt]: new Date(after) };
  }

  const roomReposts = await RoomRepostModel.findAllNormalized({
    authUserId: user.id,
    options: {
      where: {
        userId,
        ...where,
      },
      order: [ [ 'createdAt', 'DESC' ] ],
    },
    limit: (limit && limit < 25) ? limit : 10,
  });

  const rooms = await RoomModel.scope({ method: [ 'preview', user.id ] }).findAll({
    where: {
      userId,
      accessLevel: [ 'public', 'protected' ],
      ...where,
    },
    order: [ [ 'createdAt', 'DESC' ] ],
    limit: (limit && limit < 25) ? limit : 10,
  });

  response.success([
    ...roomReposts,
    ...rooms,
  ]);
}));

/*
 * DELETE
 */

router.delete('/:roomId', userAuthorize);
router.delete('/:roomId', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { roomId } = request.params;
  const roomEventsTopic = await RoomModel.getEventsTopic(roomId);
  const roomUser = await RoomUserModel.findOne({
    where: {
      roomId,
      userId: user.id,
    },
  });

  await roomUser.destroy({
    eventsTopic: roomEventsTopic,
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
