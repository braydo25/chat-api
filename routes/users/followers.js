/*
 * Route: /users/:userId/followers
 */

const UserModel = rootRequire('/models/UserModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

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
    include: [
      {
        model: UserModel,
        as: 'followerUser',
      },
    ],
    where: { userId },
  });

  response.success(userFollowers);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { userId } = request.params;

  let userFollower = await UserFollowerModel.findOne({
    where: {
      userId,
      followerUserId: user.id,
    },
  });

  if (!userFollower) {
    userFollower = await UserFollowerModel.create({
      userId,
      followerUserId: user.id,
    });
  }

  response.success(userFollower);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { userId } = request.params;

  const userFollower = await UserFollowerModel.findOne({
    where: {
      userId,
      followerUserId: user.id,
    },
  });

  if (userFollower) {
    await userFollower.destroy();
  }

  response.success();
}));

/*
 * Export
 */

module.exports = router;
