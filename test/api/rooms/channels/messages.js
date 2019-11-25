const helpers = require('../../helpers');

describe('Channel Messages', () => {
  /*
   * POST
   */

  describe('POST /channels/{channel.id}/messages', () => {
    it('200s with created channel message object', done => {
      done('todo');
    });

    it('401s when user is not a member of channel', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/channels/${testRoomOneChannelOne.id}/messages`);
  });

  /*
   * GET
   */

  describe('GET /channels/{channel.id}/messages', () => {
    it('200s with an array of channel messages ordered by recency', done => {
      done('todo');
    });

    it('401s when user is not a member of channel', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('get', `/channels/${testRoomOneChannelOne.id}/messages`);
  });

  /*
   * PATCH
   */

  describe('PATCH /channels/{channel.id}/messages/{channelMessage.id}', () => {
    it('200s with update channel message object', done => {
      done('todo');
    });

    it('401s when user is not owner of channel message', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/channels/${testRoomOneChannelOne.id}/messages/${testRoomOneChannelOneMessageOne}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /channels/{channel.id}/messages/{channelMessage.id}', () => {
    it('204s and deletes channel message when provided channel message hash id owned by authorized user', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/channels/${testRoomOneChannelOne.id}/messages/${testRoomOneChannelOneMessageOne}`);
  });
});
