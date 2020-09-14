const activityRouter = rootRequire('/routes/activity');
const attachmentsRouter = rootRequire('/routes/attachments');
const roomsRouter = rootRequire('/routes/rooms');
const roomMessagesRouter = rootRequire('/routes/rooms/messages');
const roomMessageReactionsRouter = rootRequire('/routes/rooms/messages/reactions');
const roomPinsRouter = rootRequire('/routes/rooms/pins');
const roomRepostsRouter = rootRequire('/routes/rooms/reposts');
const roomTypingRouter = rootRequire('/routes/rooms/typing');
const roomUsersRouter = rootRequire('/routes/rooms/users');
const devicesRouter = rootRequire('/routes/devices');
const embedsRouter = rootRequire('/routes/embeds');
const healthRouter = rootRequire('/routes/health');
const usersRouter = rootRequire('/routes/users');
const userRoomsRouter = rootRequire('/routes/users/rooms');
const userRoomDataRouter = rootRequire('/routes/users/rooms/data');
const userFollowersRouter = rootRequire('/routes/users/followers');

module.exports = app => {
  // API Route Definitions
  app.use('/activity', activityRouter);
  app.use('/attachments', attachmentsRouter);
  app.use('/rooms', roomsRouter);
  app.use('/rooms/:roomId/messages/:roomMessageId?', roomMessagesRouter);
  app.use('/rooms/:roomId/messages/:roomMessageId/reactions/:roomMessageReactionId?', roomMessageReactionsRouter);
  app.use('/rooms/:roomId/pins/:roomMessageId', roomPinsRouter);
  app.use('/rooms/:roomId/reposts/:roomRepostId?', roomRepostsRouter);
  app.use('/rooms/:roomId/typing', roomTypingRouter);
  app.use('/rooms/:roomId/users/:roomUserId?', roomUsersRouter);
  app.use('/devices', devicesRouter);
  app.use('/embeds', embedsRouter);
  app.use('/health', healthRouter);
  app.use('/users/:userId?', usersRouter);
  app.use('/users/:userId/rooms', userRoomsRouter);
  app.use('/users/:userId/followers', userFollowersRouter);
  app.use('/users/:userId/rooms/:roomId/data', userRoomDataRouter);

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
