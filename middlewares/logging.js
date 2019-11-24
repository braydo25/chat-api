/*
 * Request Details Association For System Logs
 */

module.exports = (request, response, next) => {
  response.requestLogging = {
    url: request.url,
    method: request.method,
    body: request.body,
    headers: request.headers,
    cookies: request.cookies,
    ip: request.ip,
    params: request.params,
    query: request.query,
  };

  next();
};
