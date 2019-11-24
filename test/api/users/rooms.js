const helpers = require('../../helpers');

describe('User Rooms', () => {
  /*
   * POST
   */

  describe('POST /users/@me/rooms', () => {
    it('204s and adds user to room', done => {
      done('todo');
    });

    it('400s when provided room name that already exists', done => {
      done('todo');
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/users/@me/rooms');
  });

  /*
   * GET
   */

  describe('GET /users/@me/rooms', () => {
    it('200s with an array of rooms user has joined', done => {
      done('todo');
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/users/@me/rooms');
  });

  /*
   * DELETE
   */

  describe('DELETE /users/@me/rooms', () => {
    it('204s and removes user from room', done => {
      done('todo');
    });

  //  helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/users/@me/rooms/${testRoomOne.hashId}`);
  });
});
