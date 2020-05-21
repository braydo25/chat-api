/*
 * Route: /embeds
 */

const EmbedModel = rootRequire('/models/EmbedModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const metascraperHelpers = rootRequire('/libs/metascraperHelpers');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { url } = request.body;

  if (!url) {
    throw new Error('A url must be provided');
  }

  let embed = await EmbedModel.findOne({ where: { url } });

  if (!embed) {
    const metadata = await metascraperHelpers.extractMetadata(url);

    embed = await EmbedModel.create({
      userId: user.id,
      title: metadata.title,
      description: metadata.description,
      language: metadata.lang,
      author: metadata.author,
      publisher: metadata.publisher,
      date: metadata.date,
      contentType: metadata.responseHeaders['content-type'],
      responseHeaders: metadata.responseHeaders,
      url: url,
      logoUrl: metadata.logo,
      audioUrl: metadata.audio,
      imageUrl: metadata.image,
      videoUrl: metadata.video,
    });
  }

  response.success(embed);
}));

/*
 * Export
 */

module.exports = router;
