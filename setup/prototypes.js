const awsHelpers = rootRequire('/libs/awsHelpers');
const hashIdHelpers = rootRequire('/libs/hashIdHelpers');

/*
 * Express
 */

express.response.respond = function(httpCode, data) {
  if (![ 200, 204 ].includes(httpCode)) {
    awsHelpers.logEvent({
      event: 'httpResponse',
      data: {
        url: this.requestLogging.url,
        responseCode: httpCode,
        requestDetails: {
          method: this.requestLogging.method,
          body: this.requestLogging.body,
          headers: this.requestLogging.headers,
          cookies: this.requestLogging.cookies,
          ip: this.requestLogging.ip,
          params: this.requestLogging.params,
          query: this.requestLogging.query,
        },
        responseData: data,
      },
    });
  }

  this.status(httpCode).set('Connection', 'close').json(data);
};

express.response.success = function(data) {
  const httpCode = (data) ? 200 : 204;

  this.respond(httpCode, data);
};

express.response.error = function(data) {
  this.respond(400, data);
};

/*
 * Sequelize
 */

Sequelize.genericHashId = () => {
  return {
    type: Sequelize.STRING,
    unique: true,
  };
}

Sequelize.assignHashId = async function(instance, options) {
  const { transaction } = options;

  await instance.update({
    hashId: hashIdHelpers.encode(instance.id),
  }, { transaction });
}
