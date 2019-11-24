/*
 * User Authorization For Matching Routes
 * Possible Route Usage: /{any}
 */

const UserModel = rootRequire('/models/UserModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const accessToken = request.get('X-Access-Token');
  const user = await UserModel.findOne({ where: { accessToken } });

  if (!user) {
    return response.respond(401, 'Invalid credentials.');
  }

  request.user = user;

  next();
});
