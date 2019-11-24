const helpers = require('../../../helpers');

describe('Channel Message Reactions', () => {
  /*
   * POST
   */

  describe('POST /channels/{channel.hashId}/messages/{channelMessage.hashId}/reactions', () => {
    it('200s with created channel message reaction object', done => {
      done('todo');
    });

    it('401s when user is not a member of channel', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/channels/${testRoomOneChannelOne.hashId}/messages/${testRoomOneChannelOneMessageOne}/reactions`);
  });

  /*
   * DELETE
   */

  describe('DELETE /channels/{channel.hashId}/messages/{channelMessage.hashId}/reactions/{channelMessageReaction.hashId}', () => {
//    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/channels/${testRoomOneChannelOne.hashId}/messages/${testRoomOneChannelOneMessageOne}/reactions`);
  });
});
