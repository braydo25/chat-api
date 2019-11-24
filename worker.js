const express = require('express');
const app = express();

require('./setup/globals');
rootRequire('/setup/aws');
rootRequire('/setup/prototypes');
rootRequire('/setup/models').then(() => {
  rootRequire('/setup/middlewares')(app);
  rootRequire('/setup/routes')(app);

  app.listen(process.env.PORT, () => {
    console.log(JSON.stringify({ event: 'start' }));
  });
});
