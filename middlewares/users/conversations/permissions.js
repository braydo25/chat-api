/*
 * User Conversation Permissions For Matching Routes
 * Must be mounted after users authorize and conversation associate or authorize.
 * Possible Route Usage: /{any}/conversations/:converastionId/{any}
 */

const ConversationUserModel = rootRequire('/models/ConversationUserModel');

module.exports = permissions => {
  return asyncMiddleware(async (request, response, next) => {
    const { user, conversation } = request;
    const conversationUser = await ConversationUserModel.findOne({
      where: {
        userId: user.id,
        conversationId: conversation.id,
      },
    });

    const requiredPermissions = [
      ...((permissions[conversation.accessLevel]) ? permissions[conversation.accessLevel] : []),
      ...((permissions.anyAccessLevel) ? permissions.anyAccessLevel : []),
    ];

    if (requiredPermissions.length) {
      const authorized = (conversationUser) ? requiredPermissions.every(permission => {
        return conversationUser.permissions.includes(permission);
      }) : false;

      if (!authorized) {
        return response.respond(403, 'Insufficient conversation permissions.');
      }
    }

    request.conversationUser = conversationUser;

    next();
  });
};
