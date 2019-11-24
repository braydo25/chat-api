const channelMessagesRouter = rootRequire('/routes/channels/messages');
const channelMessageReactionsRouter = rootRequire('/routes/channels/messages/reactions');
const healthRouter = rootRequire('/routes/health');
const roomsRouter = rootRequire('/routes/rooms');
const roomChannelsRouter = rootRequire('/routes/rooms/channels');
const usersRouter = rootRequire('/routes/users');
const userRoomsRouter = rootRequire('/routes/users/rooms');

module.exports = app => {
  // API Route Definitions
  app.use('/channels/:channelId/messages/:channelMessageId?', channelMessagesRouter);
  app.use('/channels/:channelId/messages/:channelMessageId/reactions/:channelMessageReactionId?', channelMessageReactionsRouter);
  app.use('/health', healthRouter);
  app.use('/rooms/:roomId?', roomsRouter);
  app.use('/rooms/:roomId/channels/:channelId?', roomChannelsRouter);
  app.use('/users/:userId?', usersRouter);
  app.use('/users/:userId/rooms/:roomUserId?', userRoomsRouter);

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
