/*
 * Route: /users/:userId/followers
 */

const UserActivityModel = rootRequire('/models/UserActivityModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');
const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const userFollowerAuthorize = rootRequire('/middlewares/users/followers/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { userId } = request.params;

  const userFollowers = await UserFollowerModel.findAll({
    where: { userId },
  });

  response.success(userFollowers);
}));

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { userId } = request.params;
  const data = {
    userId,
    followerUserId: user.id,
  };

  let userFollower = await UserFollowerModel.findOne({
    where: data,
    paranoid: false,
  });

  if (!userFollower) {
    const transaction = await database.transaction();

    try {
      userFollower = await UserFollowerModel.create(data, {
        setDataValues: { followerUser: user },
        transaction,
      });

      const eventsTopic = await UserModel.getEventsTopic(userId);

      await UserActivityModel.create({
        userId,
        userFollowerId: userFollower.id,
      }, {
        eventsTopic,
        setDataValues: { userFollower },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      throw error;
    }

    UserDeviceModel.sendPushNotificationForUserId({
      userId,
      title: 'You have a new follower.',
      message: `${user.name} (@${user.username}) is now following you 🎉`,
    });
  } else {
    await userFollower.restore();
  }

  response.success(userFollower);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', userFollowerAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { userFollower } = request;

  await userFollower.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
