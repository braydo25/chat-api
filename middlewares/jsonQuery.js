/*
 * Request Query String JSON Values Parser
 */

module.exports = (request, response, next) => {
  const { query } = request;

  if (query) {
    Object.keys(query).forEach(paramName => {
      try {
        query[paramName] = JSON.parse(query[paramName]);
      } catch(e) {
        // noop
      }
    });
  }

  next();
};
