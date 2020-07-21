const ConversationModel = rootRequire('/models/ConversationModel');
const UserModel = rootRequire('/models/UserModel');

/*
 * Model Defitinion
 */

const ConversationRepostModel = database.define('conversationRepost', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  conversationId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
}, {
  scopes: {
    complete: authUserId => ({
      attributes: [ 'id' ],
      include: [
        ConversationModel.scope({ method: [ 'preview', authUserId ] }),
        UserModel,
      ],
    }),
  },
});

/*
 * Class Methods
 */

ConversationRepostModel.findAllNormalized = async function({ authUserId, options }) {
  // TODO: it would be better if we could factor this into the ConversationModel
  // complete scope somehow for just a singular conversations query to include
  // reposts as well..?

  const conversationReposts = await ConversationRepostModel.scope({
    method: [ 'complete', authUserId ],
  }).findAll(options);

  return conversationReposts.map(conversationRepost => ({
    ...conversationRepost.toJSON().conversation,
    conversationRepostId: conversationRepost.id,
    conversationRepostUser: conversationRepost.user,
  }));
};

/*
 * Export
 */

module.exports = ConversationRepostModel;
