/*
 * Route: /conversations/:conversationId/reposts
 */

const ConversationRepostModel = rootRequire('/models/ConversationRepostModel');
const UserActivityModel = rootRequire('/models/UserActivityModel');
const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
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
    const transaction = await database.transaction();

    try {
      conversationRepost = await ConversationRepostModel.create({
        userId: user.id,
        conversationId: conversation.id,
      }, {
        eventsTopic: conversation.eventsTopic,
        transaction,
      });

      await UserActivityModel.create({
        userId: conversation.userId,
        conversationRepostId: conversationRepost.id,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      throw error;
    }

    UserDeviceModel.sendPushNotificationForUserId({
      userId: conversation.userId,
      title: 'Your conversation was reposted.',
      message: `${user.name} (@${user.username}) reposted your conversation "${conversation.title}" with all their followers.`,
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
router.delete('/', asyncMiddleware(async (request, response) => {
  const { user, conversation } = request;
  const conversationRepost = await ConversationRepostModel.findOne({
    where: {
      conversationId: conversation.id,
      userId: user.id,
    },
  });

  if (!conversationRepost) {
    throw new Error('There is no active repost by you for this conversation.');
  }

  await conversationRepost.destroy({
    eventsTopic: conversation.eventsTopic,
  });

  response.success();
}));

/*
 * Export
 */

module.exports = router;
