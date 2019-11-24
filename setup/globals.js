const path = require('path');

const rootPath = __dirname.replace('/setup', '');

global.rootRequire = filePath => {
  return require(path.join(rootPath, filePath));
};

global.asyncMiddleware = fn => (request, response, next) => {
  Promise.resolve(fn(request, response, next)).catch(next);
};

global.express = require('express');
global.Sequelize = require('sequelize');
global.database = rootRequire('/libs/database');
