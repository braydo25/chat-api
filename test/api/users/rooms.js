const helpers = require('../../helpers');

describe('User Rooms', () => {
  /*
   * POST
   */

  describe('POST /users/@me/rooms', () => {
    it('200s with room user object', done => {
      chai.request(server)
        .post(`/users/@me/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('id');
          response.body.should.have.property('permissions');
          response.body.roomId.should.equal(testRoomOne.id);
          response.body.userId.should.equal(testUserTwo.id);
          done();
        });
    });

    it('400s when user has already joined the room', done => {
      chai.request(server)
        .post(`/users/@me/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/users/@me/rooms');
  });

  /*
   * GET
   */

  describe('GET /users/@me/rooms', () => {
    it('200s with an array of rooms user has joined', done => {
      chai.request(server)
        .get('/users/@me/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(roomUser => {
            roomUser.should.have.property('id');
            roomUser.should.have.property('permissions');
            roomUser.should.have.property('room');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/users/@me/rooms');
  });

  /*
   * DELETE
   */

  describe('DELETE /users/@me/rooms', () => {
    it('204s and removes authorized user from room', done => {
      chai.request(server)
        .delete(`/users/@me/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/users/@me/rooms/${testRoomOne.id}`);
  });
});
