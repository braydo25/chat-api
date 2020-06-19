const attachmentsRouter = rootRequire('/routes/attachments');
const conversationsRouter = rootRequire('/routes/conversations');
const conversationMessagesRouter = rootRequire('/routes/conversations/messages');
const conversationMessageReactionsRouter = rootRequire('/routes/conversations/messages/reactions');
const conversationTypingRouter = rootRequire('/routes/conversations/typing');
const conversationUsersRouter = rootRequire('/routes/conversations/users');
const embedsRouter = rootRequire('/routes/embeds');
const healthRouter = rootRequire('/routes/health');
const usersRouter = rootRequire('/routes/users');
const userConversationsRouter = rootRequire('/routes/users/conversations');
const userFollowersRouter = rootRequire('/routes/users/followers');

module.exports = app => {
  // API Route Definitions
  app.use('/attachments', attachmentsRouter);
  app.use('/conversations', conversationsRouter);
  app.use('/conversations/:conversationId/messages/:conversationMessageId?', conversationMessagesRouter);
  app.use('/conversations/:conversationId/messages/:conversationMessageId/reactions/:conversationMessageReactionId?', conversationMessageReactionsRouter);
  app.use('/conversations/:conversationId/typing', conversationTypingRouter);
  app.use('/conversations/:conversationId/users/:conversationUserId?', conversationUsersRouter);
  app.use('/embeds', embedsRouter);
  app.use('/health', healthRouter);
  app.use('/users/:userId?', usersRouter);
  app.use('/users/:userId/conversations', userConversationsRouter);
  app.use('/users/:userId/followers', userFollowersRouter);

  // Handle Various Errors
  app.use((error, request, response, next) => {
    if (error instanceof Sequelize.ValidationError) {
      return response.error(error.errors[0].message);
    }

    response.error(error.message);
  });

  // Handle Nonexistent Routes
  app.use((request, response) => {
    response.respond(404, `${request.method} request for ${request.url} is not valid.`);
  });
};
