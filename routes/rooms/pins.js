/*
 * Route: /rooms/:roomId/pins/:roomMessageId
 */

const roomAssociate = rootRequire('/middlewares/rooms/associate');
const roomMessageAssociate = rootRequire('/middlewares/rooms/messages/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userRoomPermissions = rootRequire('/middlewares/users/rooms/permissions');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', roomAssociate);
router.put('/', roomMessageAssociate);
router.put('/', userRoomPermissions({ anyAccessLevel: [ 'ROOM_MESSAGE_PINS_CREATE' ] }));
router.put('/', asyncMiddleware(async (request, response) => {
  const { roomMessage } = request;

  await roomMessage.update({ pinnedAt: new Date() });

  response.success(roomMessage);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomAssociate);
router.delete('/', roomMessageAssociate);
router.delete('/', userRoomPermissions({ anyAccessLevel: [ 'ROOM_MESSAGE_PINS_DELETE' ] }));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { roomMessage } = request;

  await roomMessage.update({ pinnedAt: null });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
