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
  language: {
    type: Sequelize.STRING,
  },
  author: {
    type: Sequelize.TEXT,
  },
  publisher: {
    type: Sequelize.TEXT,
  },
  date: {
    type: Sequelize.DATE(4),
  },
  contentType: {
    type: Sequelize.STRING,
  },
  responseHeaders: {
    type: Sequelize.JSON,
  },
  url: {
    type: Sequelize.TEXT,
  },
  logoUrl: {
    type: Sequelize.TEXT,
  },
  audioUrl: {
    type: Sequelize.TEXT,
  },
  imageUrl: {
    type: Sequelize.TEXT,
  },
  videoUrl: {
    type: Sequelize.TEXT,
  },
}, {
  defaultScope: {
    attributes: [
      'id',
      'title',
      'description',
      'language',
      'author',
      'publisher',
      'date',
      'contentType',
      'url',
      'logoUrl',
      'audioUrl',
      'imageUrl',
      'videoUrl',
    ],
  },
});

/*
 * Export
 */

module.exports = EmbedModel;
