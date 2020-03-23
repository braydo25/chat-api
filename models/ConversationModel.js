const permissions = [ 'public', 'private' ];

/*
 * Model Definition
 */

const ConversationModel = database.define('conversation', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  permission: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [ permissions ],
        msg: 'The permission provided is invalid.',
      },
    },
  },
});

/*
 * Export
 */

module.exports = ConversationModel;
