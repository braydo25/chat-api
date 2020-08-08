/*
 * Route: /users/:userId/conversations/:conversationId?
 */

const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationRepostModel = rootRequire('/models/ConversationRepostModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
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
  const { userId } = request.params;
  const { before, after, limit } = request.query;
  const where = {};

  if (before) {
    where.createdAt = { [Sequelize.Op.lt]: new Date(before) };
  }

  if (after) {
    where.createdAt = { [Sequelize.Op.gt]: new Date(after) };
  }

  const conversationReposts = await ConversationRepostModel.findAllNormalized({
    authUserId: user.id,
    options: {
      where: {
        userId,
        ...where,
      },
      order: [ [ 'createdAt', 'DESC' ] ],
    },
    limit: (limit && limit < 25) ? limit : 10,
  });

  const conversations = await ConversationModel.scope({ method: [ 'preview', user.id ] }).findAll({
    where: {
      userId,
      accessLevel: [ 'public', 'protected' ],
      ...where,
    },
    order: [ [ 'createdAt', 'DESC' ] ],
    limit: (limit && limit < 25) ? limit : 10,
  });

  response.success([
    ...conversationReposts,
    ...conversations,
  ]);
}));

/*
 * DELETE
 */

router.delete('/:conversationId', userAuthorize);
router.delete('/:conversationId', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { conversationId } = request.params;
  const conversationEventsTopic = await ConversationModel.getEventsTopic(conversationId);
  const conversationUser = await ConversationUserModel.findOne({
    where: {
      conversationId,
      userId: user.id,
    },
  });

  await conversationUser.destroy({
    eventsTopic: conversationEventsTopic,
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
