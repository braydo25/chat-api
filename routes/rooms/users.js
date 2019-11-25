/*
 * Route: /rooms/:roomId/users/:userId?
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
  const { roomId } = request.params;
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
      roomId: roomId,
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
  const { roomId, userId } = request.params;
  const roomUser = await RoomUserModel.findOne({ where: { roomId, userId } });

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
  const { roomId, userId } = request.params;
  const roomUser = await RoomUserModel.findOne({ where: { roomId, userId } });

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
