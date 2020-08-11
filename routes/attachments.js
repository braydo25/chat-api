/*
 * Route: /attachments
 */

const AttachmentModel = rootRequire('/models/AttachmentModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const awsHelpers = rootRequire('/libs/awsHelpers');
const mediaHelpers = rootRequire('/libs/mediaHelpers');

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
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, files } = request;
  const file = (files && files.file) ? files.file : null;

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
    let width = null;
    let height = null;

    if (file.mimetype.includes('image/')) {
      const dimensions = mediaHelpers.getImageDimensionsSync(file.data);

      width = dimensions.width;
      height = dimensions.height;
    }

    if (file.mimetype.includes('video/')) {
      const dimensions = await mediaHelpers.getVideoDimensions(file.data);

      width = dimensions.width;
      height = dimensions.height;
    }

    attachment = await AttachmentModel.create({
      userId: user.id,
      filename: file.name,
      bytes: file.size,
      url: uploadUrl,
      mimetype: file.mimetype,
      checksum: file.md5,
      width,
      height,
    });
  }

  response.success(attachment);
}));

/*
 * Export
 */

module.exports = router;
