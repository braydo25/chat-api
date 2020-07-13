/*
 * Route: /conversations/:conversationId/reposts/:conversationRepostId?
 */

const ConversationRepostModel = rootRequire('/models/ConversationRepostModel');
const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationRepostAuthorize = rootRequire('/middlewares/conversations/reposts/authorize');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', conversationAssociate);
router.put('/', asyncMiddleware(async (request, response) => {
  const { user, conversation } = request;

  if (conversation.accessLevel === 'private') {
    throw new Error('Private conversations cannot be reposted.');
  }

  if (user.id === conversation.userId) {
    throw new Error('You cannot repost your own conversations.');
  }

  let conversationRepost = await ConversationRepostModel.findOne({
    where: {
      userId: user.id,
      conversationId: conversation.id,
    },
    paranoid: false,
  });

  if (!conversationRepost) {
    conversationRepost = await ConversationRepostModel.create({
      userId: user.id,
      conversationId: conversation.id,
    });

    UserDeviceModel.sendPushNotificationForUserId({
      userId: conversation.userId,
      title: 'Your conversation was shared.',
      message: `${user.name} (@${user.username}) shared your conversation "${conversation.title}" with all their followers.`,
    });
  } else {
    await conversationRepost.restore();
  }

  response.success(conversationRepost);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationAssociate);
router.delete('/', conversationRepostAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  const { conversationRepost } = request;

  await conversationRepost.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
