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
    attributes: [
      'id',
      'userId',
      'createdAt',
    ],
    include: [
      {
        model: UserModel,
        as: 'followerUser',
      },
    ],
  },
});

/*
 * Hooks
 */

UserFollowerModel.addHook('afterCreate', (userFollower, options) => {
  return UserModel.update({ followersCount: database.literal('followersCount + 1') }, {
    where: { id: userFollower.userId },
    transaction: options.transaction,
  });
});

UserFollowerModel.addHook('afterDestroy', (userFollower, options) => {
  return UserModel.update({ followersCount: database.literal('followersCount - 1') }, {
    where: { id: userFollower.userId },
    transaction: options.transaction,
  });
});

/*
 * Export
 */

module.exports = UserFollowerModel;
