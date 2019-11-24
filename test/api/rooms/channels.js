const helpers = require('../../helpers');

describe('Room Channels', () => {
  /*
   * POST
   */

  describe('POST /rooms/{room.hashId}/channels', () => {
    it('200s with created room channel object when provided name', done => {
      /*const fields = {
        name: 'GitGud',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.hashId}/channels`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          done();
        });*/

      done('todo');
    });

    it('400s when provided channel name that already exists for room', done => {
      done('todo');
    });

    it('401s when authorized user does not have permission to create channels for this room', done => {
      done('todo');
    });

    //helpers.it401sWhenUserAuthorizationIsInvalid('post', `/rooms/${testRoomOne.hashId}/channels`);
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms/{room.hashId}', () => {
    it('200s with updated room channel object', done => {
      done('todo');
    });

    it('401s when updating user does not have permission', done => {
      done('todo');
    });

  //    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/rooms/${testRoomOne.hashId}/channels/${testRoomOneChannelOne.hashId}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/{room.hashId}', () => {
    it('204s and deletes room channel', done => {
      done('todo');
    });

    it('401s when authorized user does not have permission', done => {
      done('todo');
    });

  //    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/rooms/${testRoomOne.hashId}/channels/${testRoomOneChannelOne.hashId}`);
  });
});
