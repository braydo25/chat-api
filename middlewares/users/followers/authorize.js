/*
 * User Follower Authorization For Matching Routes
 * Must be mounted after users authorize.
 * Possible Route Usage: /{any}/users/:userId/{any}
 */

const UserFollowerModel = rootRequire('/models/UserFollowerModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { user } = request;
  const { userId } = request.params;
  const userFollower = await UserFollowerModel.findOne({
    where: {
      userId,
      followerUserId: user.id,
    },
  });

  if (!userFollower) {
    return response.respond('Insufficient user follower permissions.');
  }

  request.userFollower = userFollower;

  next();
});
