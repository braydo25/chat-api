/*
 * Route: /users/:userId/rooms/:roomId/data
 */

const UserRoomDataModel = rootRequire('/models/UserRoomDataModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const roomAssociate = rootRequire('/middlewares/rooms/associate');

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

  let userRoomData = await UserRoomDataModel.findOne({
    where: {
      roomId: room.id,
      userId: user.id,
    },
  });

  if (userRoomData) {
    await userRoomData.update({ lastReadAt: new Date() });
  } else {
    userRoomData = await UserRoomDataModel.create({
      userId: user.id,
      roomId: room.id,
      lastReadAt: new Date(),
    });
  }

  response.success(userRoomData);
}));

/*
 * Export
 */

module.exports = router;
