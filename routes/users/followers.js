/*
 * Route: /users/:userId/followers
 */

const UserModel = rootRequire('/models/UserModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');
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

  let userFollower = await UserFollowerModel.findOne({ where: data });

  if (!userFollower) {
    userFollower = await UserFollowerModel.create(data);
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
