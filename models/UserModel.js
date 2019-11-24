const hashIdHelpers = rootRequire('/libs/hashIdHelpers');
/*
 * Model Definition
 */

const UserModel = database.define('user', {
  id: Sequelize.generateGenericIdAttribute({ hashPrefix: 'u' }),
  accessToken: {
    type: Sequelize.UUID,
    unique: true,
    defaultValue: Sequelize.UUIDV1,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
  },
  iconHash: {
    type: Sequelize.STRING,
  },
});

/*
 * Export
 */

module.exports = UserModel;
