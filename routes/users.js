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

  if (!userId) {
    throw new Error('A user id must be provided.');
  }

  const user = await UserModel.findOne({
    attributes: [
      'id',
      'username',
      'name',
      'about',
      [ database.fn('COUNT', database.col('userFollowers.id')), 'followersCount' ],
    ],
    include: [
      {
        model: AttachmentModel.scope('avatar'),
        as: 'avatarAttachment',
      },
      {
        attributes: [],
        model: UserFollowerModel.unscoped(),
      },
    ],
    where: { id: userId },
  });

  if (!user) {
    throw new Error('This user does not exist.');
  }

  return response.success(user);
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

  user.avatarAttachmentId = avatarAttachmentId || user.avatarAttachmentId;
  user.username = request.body.username || user.username;
  user.name = request.body.name || user.name;
  user.about = request.body.about || user.about;

  user.setDataValue('avatarAttachment', attachment || user.avatarAttachment);

  await user.save();

  response.success(user);
}));

/*
 * Export
 */

module.exports = router;
