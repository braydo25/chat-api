const compression = require('compression');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const logging = rootRequire('/middlewares/logging');
const serverConfig = rootRequire('/config/server');

module.exports = app => {
  app.use(compression());

  app.use(bodyParser.json({
    limit: serverConfig.maxRequestBodySize,
  }));

  app.use(bodyParser.urlencoded({
    extended: false,
    limit: serverConfig.maxRequestBodySize,
  }));


  app.use(fileUpload());

  app.use(logging);
};
