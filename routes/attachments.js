/*
 * Route: /attachments
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const awsHelpers = rootRequire('/libs/awsHelpers');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { filename, checksum } = request.query;

  if (!filename || !checksum) {
    throw new Error('Please provide a filename and checksum.');
  }

  const attachment = await AttachmentModel.findOne({
    where: {
      userId: user.id,
      filename,
      checksum,
    },
  });

  response.success(attachment);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user, files } = request;
  const file = files.file;

  if (!file) {
    throw new Error('A file must be provided.');
  }

  let attachment = await AttachmentModel.findOne({
    where: {
      userId: user.id,
      filename: file.name,
      checksum: file.md5,
    },
  });

  if (!attachment) {
    const uploadUrl = await awsHelpers.uploadFileToS3(file.data, file.name);

    attachment = await AttachmentModel.create({
      userId: user.id,
      filename: file.name,
      bytes: file.size,
      url: uploadUrl,
      mimetype: file.mimetype,
      checksum: file.md5,
    });
  }

  response.success(attachment);
}));

/*
 * Export
 */

module.exports = router;
