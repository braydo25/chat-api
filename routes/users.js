/*
 * Route: /users
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

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

  user.setDataValue('avatarAttachment', attachment || user.avatarAttachment);

  await user.save();

  response.success(user);
}));

/*
 * Export
 */

module.exports = router;
