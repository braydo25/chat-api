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
  const { before, after, viewed } = request.query;
  const where = {};

  if (before) {
    where.id = { [Sequelize.Op.lt]: before };
  }

  if (after) {
    where.id = { [Sequelize.Op.gt]: after };
  }

  if (viewed) {
    await user.update({ lastViewedActivityAt: new Date() });
  }

  const activity = await UserActivityModel.findAll({
    where: {
      userId: user.id,
      ...where,
    },
    order: [ [ 'createdAt', 'DESC' ] ],
  });

  response.success(activity);
}));

/*
 * Export
 */

module.exports = router;
