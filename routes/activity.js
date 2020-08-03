/*
 * Route: /activity
 */

const UserActivityModel = rootRequire('/models/UserActivityModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;

  const activity = await UserActivityModel.findAll({
    where: { userId: user.id },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(activity);
}));

/*
 * Export
 */

module.exports = router;
