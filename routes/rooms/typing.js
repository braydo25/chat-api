/*
 * Route: /rooms/:roomId/typing
 */

const roomAssociate = rootRequire('/middlewares/rooms/associate');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userRoomPermissions = rootRequire('/middlewares/users/rooms/permissions');
const events = rootRequire('/libs/events');

const router = express.Router({
  mergeParams: true,
});

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
  const { user, room } = request;

  events.publish({
    topic: room.eventsTopic,
    name: 'ROOM_MESSAGE_TYPING_START',
    data: {
      user: {
        id: user.id,
        roomId: room.id,
        name: user.name,
        typingAt: new Date(),
      },
    },
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
