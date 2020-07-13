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
 * Export
 */

module.exports = ConversationRepostModel;
