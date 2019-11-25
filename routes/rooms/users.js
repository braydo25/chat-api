/*
 * Route: /rooms/:roomId/users/:roomUserId?
 */

const RoomUserModel = rootRequire('/models/RoomUserModel');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const roomAssociate = rootRequire('/middlewares/rooms/associate');
const roomPermissionsAuthorize = rootRequire('/middlewares/rooms/permissionsAuthorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', roomAssociate);
router.get('/', asyncMiddleware(async (request, response) => {
  const { room } = request;
  const roomUsers = await RoomUserModel.findAll({
    attributes: [ 'id', 'permissions' ],
    include: [
      {
        attributes: [ 'id', 'username', 'name', 'iconHash' ],
        model: UserModel,
        required: true,
      },
    ],
    where: {
      roomId: room.id,
      banned: false,
    },
  });

  response.success(roomUsers);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', roomPermissionsAuthorize([ 'ADMIN', 'MODERATOR' ]));
router.patch('/', asyncMiddleware(async (request, response) => {
  const { roomUserId } = request.params;
  const roomUser = await RoomUserModel.findOne({ where: { id: roomUserId } });

  if (!roomUser) {
    throw new Error('This user is not a member of this room.');
  }

  if (request.roomUser.permissions.includes('ADMIN')) {
    roomUser.permissions = request.body.permissions || roomUser.permissions;
  }

  roomUser.banned = request.body.banned || roomUser.banned;

  response.success(roomUser);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomPermissionsAuthorize([ 'ADMIN', 'MODERATOR' ]));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { roomUserId } = request.params;
  const roomUser = await RoomUserModel.findOne({ where: { id: roomUserId } });

  if (!roomUser) {
    throw new Error('This user is not a member of this room.');
  }

  await roomUser.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
