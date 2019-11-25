const healthRouter = rootRequire('/routes/health');
const roomsRouter = rootRequire('/routes/rooms');
const roomChannelsRouter = rootRequire('/routes/rooms/channels');
const roomChannelMessagesRouter = rootRequire('/routes/rooms/channels/messages');
const roomChannelMessageReactionsRouter = rootRequire('/routes/rooms/channels/messages/reactions');
const usersRouter = rootRequire('/routes/users');
const userRoomsRouter = rootRequire('/routes/users/rooms');

module.exports = app => {
  // API Route Definitions
  app.use('/health', healthRouter);
  app.use('/rooms/:roomId?', roomsRouter);
  app.use('/rooms/:roomId/channels/:roomChannelId?', roomChannelsRouter);
  app.use('/rooms/:roomId/channels/:roomChannelId/messages/:roomChannelMessageId?', roomChannelMessagesRouter);
  app.use('/rooms/:roomId/channels/:roomChannelId/messages/:roomChannelMessageId/reactions/:roomChannelMessageReactionId?', roomChannelMessageReactionsRouter);
  app.use('/users/:userId?', usersRouter);
  app.use('/users/:userId/rooms/:roomId?', userRoomsRouter);

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
