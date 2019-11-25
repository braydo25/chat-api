/*
 * Route: /users/@me/rooms/:roomId?
 */

const RoomModel = rootRequire('/models/RoomModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const roomAssociate = rootRequire('/middlewares/rooms/associate');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const rooms = await RoomUserModel.findAll({
    attributes: [ 'id', 'permissions' ],
    include: [
      {
        attributes: [ 'id', 'name', 'description', 'iconHash' ],
        model: RoomModel,
        required: true,
      },
    ],
    where: {
      userId: user.id,
      banned: false,
    },
  });

  response.success(rooms);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', roomAssociate);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user, room } = request;
  const roomUserExists = await RoomUserModel.count({
    where: {
      roomId: room.id,
      userId: user.id,
    },
  });

  if (roomUserExists) {
    throw new Error('You have already joined this room.');
  }

  const roomUser = await RoomUserModel.create({
    roomId: room.id,
    userId: user.id,
  });

  response.success(roomUser);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomAssociate);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { user, room } = request;
  const roomUser = await RoomUserModel.findOne({
    where: {
      roomId: room.id,
      userId: user.id,
      banned: false,
    },
  });

  if (roomUser) {
    await roomUser.destroy();
  }

  response.success();
}));

/*
 * Export
 */

module.exports = router;
