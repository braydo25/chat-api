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
});

/*
 * Export
 */

module.exports = UserFollowerModel;
