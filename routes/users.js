/*
 * Route: /users/:userId?
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');
const UserModel = rootRequire('/models/UserModel');
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
  const { before, after, search } = request.query;

  if (!userId && !search) {
    throw new Error('A user id or search must be provided.');
  }

  if (userId) {
    const user = await UserModel.findOne({
      attributes: [
        'id',
        'username',
        'name',
        'about',
        'followersCount',
      ],
      include: [
        {
          model: AttachmentModel.scope('avatar'),
          as: 'avatarAttachment',
        },
        {
          model: UserFollowerModel.unscoped(),
          as: 'authUserFollower',
          where: { followerUserId: request.user.id },
          required: false,
        },
      ],
      where: { id: userId },
    });

    if (!user) {
      throw new Error('This user does not exist.');
    }

    return response.success(user);
  }

  if (search) {
    const users = await UserModel.scope('complete').findAll({
      where: {
        [Sequelize.Op.or]: {
          name: { [Sequelize.Op.like]: `%${search}%` },
          username: { [Sequelize.Op.like]: `%${search}%` },
        },
        ...((before) ? { id: { [Sequelize.Op.lt]: before } } : {}),
        ...((after) ? { id: { [Sequelize.Op.gt]: after } } : {}),
      },
      limit: 10,
    });

    return response.success(users);
  }
}));

/*
 * POST
 */

router.post('/', asyncMiddleware(async (request, response) => {
  const { phone, phoneLoginCode } = request.body;

  if (!phone) {
    throw new Error('A phone number must be provided.');
  }

  let user = await UserModel.scope('complete').findOne({ where: { phone } });

  if (!user) {
    user = await UserModel.create({ phone });
  }

  if (!phoneLoginCode) {
    await user.updateAndSendPhoneLoginCode();

    return response.success();
  }

  if (user.phoneLoginCode !== phoneLoginCode) {
    throw new Error('Incorrect login code.');
  }

  response.success(user);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { avatarAttachmentId } = request.body;

  let attachment = null;

  if (avatarAttachmentId) {
    attachment = await AttachmentModel.scope('avatar').findOne({
      where: { id: avatarAttachmentId },
    });

    if (!attachment.mimetype.includes('image/')) {
      throw new Error('Only images are allowed for avatars.');
    }
  }

  await user.update({
    avatarAttachmentId: avatarAttachmentId || user.avatarAttachmentId,
    username: request.body.username || user.username,
    name: request.body.name || user.name,
    about: (request.body.about) ? request.body.about.trim() : user.about,
  }, {
    setDataValues: { avatarAttachment: attachment || user.avatarAttachment },
  });

  response.success(user);
}));

/*
 * Export
 */

module.exports = router;
