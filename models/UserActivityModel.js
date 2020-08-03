const ConversationRepostModel = rootRequire('/models/ConversationRepostModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');

/*
 * Model Definition
 */

const UserActivityModel = database.define('userActivity', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  conversationRepostId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
  userFollowerId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
  },
}, {
  defaultScope: {
    attributes: [ 'id' ],
    include: [
      {
        model: ConversationRepostModel.scope('activityPreview'),
        required: false,
      },
      {
        model: UserFollowerModel,
        required: false,
      },
    ],
  },
});

/*
 * Export
 */

module.exports = UserActivityModel;
