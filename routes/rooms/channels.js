/*
 * Route: /rooms/:roomId/channels/:roomChannelId?
 */

const RoomChannelModel = rootRequire('/models/RoomChannelModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const roomPermissionsAuthorize = rootRequire('/middlewares/rooms/permissionsAuthorize');
const roomChannelAssociate = rootRequire('/middlewares/rooms/channels/associate');

const router = express.Router({
  mergeParams: true,
});

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', roomPermissionsAuthorize([ 'ADMIN', 'MODERATOR' ]));
router.post('/', asyncMiddleware(async (request, response) => {
  const { room } = request;
  const { name, description } = request.body;
  const roomChannelExists = await RoomChannelModel.count({
    where: {
      name,
      roomId: room.id,
    },
  });

  if (roomChannelExists) {
    throw new Error(`This room already has a channel with the name ${name}.`);
  }

  const channel = await RoomChannelModel.create({
    roomId: room.id,
    name,
    description,
  });

  response.success(channel);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', roomChannelAssociate);
router.patch('/', roomPermissionsAuthorize([ 'ADMIN', 'MODERATOR' ]));
router.patch('/', asyncMiddleware(async (request, response) => {
  const { roomChannel } = request;

  roomChannel.name = request.body.name || roomChannel.name;
  roomChannel.description = request.body.description || roomChannel.description;

  await roomChannel.save();

  response.success(roomChannel);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomChannelAssociate);
router.delete('/', roomPermissionsAuthorize([ 'ADMIN', 'MODERATOR' ]));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { roomChannel } = request;

  await roomChannel.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
