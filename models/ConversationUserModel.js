const UserModel = rootRequire('/models/UserModel');

/*
 * Model Definition
 */

const ConversationUserModel = database.define('conversationUser', {
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
  defaultScope: {
    attributes: [ 'id' ],
    include: [ UserModel ],
  },
  scopes: {
    complete: {
      include: [ UserModel ],
    },
  },
});

/*
 * Export
 */

module.exports = ConversationUserModel;
