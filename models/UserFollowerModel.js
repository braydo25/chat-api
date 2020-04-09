const UserModel = rootRequire('/models/UserModel');

/*
 * Model Definition
 */

const UserFollowerModel = database.define('userFollower', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  followerUserId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
}, {
  defaultScope: {
    attributes: [ 'id' ],
    include: [
      {
        model: UserModel,
        as: 'followerUser',
      },
    ],
  },
});

/*
 * Export
 */

module.exports = UserFollowerModel;