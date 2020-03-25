/*
 * Model Definition
 */

const EmbedModel = database.define('embed', {
  id: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  title: {
    type: Sequelize.TEXT,
  },
  description: {
    type: Sequelize.TEXT,
  },
  url: {
    type: Sequelize.TEXT,
  },
  content: {
    type: Sequelize.JSON,
  },
  image: {
    type: Sequelize.JSON,
  },
  video: {
    type: Sequelize.JSON,
  },
});

/*
 * Export
 */

module.exports = EmbedModel;
