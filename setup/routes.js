const conversationsRouter = rootRequire('/routes/conversations');
const conversationMessagesRouter = rootRequire('/routes/conversations/messages');
const healthRouter = rootRequire('/routes/health');
const usersRouter = rootRequire('/routes/users');

module.exports = app => {
  // API Route Definitions
  app.use('/conversations/:conversationId?', conversationsRouter);
  app.use('/conversations/:conversationId/messages/:conversationMessageId?', conversationMessagesRouter);
  app.use('/health', healthRouter);
  app.use('/users/:userId?', usersRouter);

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
