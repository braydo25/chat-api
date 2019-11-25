/*
 * Room Association For Matching Routes
 * Possible Route Usage: /{any}/:roomId/{any}/:roomChannelId/{any}
 */

const RoomChannelModel = rootRequire('/models/RoomChannelModel');

module.exports = asyncMiddleware(async (request, response, next) => {
  const { roomId, roomChannelId } = request.params;
  const roomChannel = await RoomChannelModel.findOne({ where: { id: roomChannelId, roomId } });

  if (!roomChannel) {
    return response.respond(400, 'This room does not exist.');
  }

  request.roomChannel = roomChannel;

  next();
});
