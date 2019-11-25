const helpers = require('../../helpers');

describe('Room Channels', () => {
  let createdRoomChannel = null;

  /*
   * POST
   */

  describe('POST /rooms/{room.id}/channels', () => {
    it('200s with created room channel object when provided name', done => {
      const fields = {
        name: 'GitGud',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/channels`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          createdRoomChannel = response.body;
          done();
        });
    });

    it('400s when provided case insensitive channel name that exists for room', done => {
      const fields = {
        name: 'gitguD',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/channels`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    it('401s when authorized user does not have permission to create channels for this room', done => {
      const fields = {
        name: 'test channel',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/channels`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/rooms/${testRoomOne.id}/channels`);
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms/{room.id}', () => {
    it('200s with updated room channel object', done => {
      const fields = {
        name: 'gudder',
        description: 'git gud chat room',
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/channels/${createdRoomChannel.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          response.body.description.should.equal(fields.description);
          done();
        });
    });

    it('401s when updating user does not have permission', done => {
      const fields = {
        name: 'test',
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/channels/${createdRoomChannel.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/rooms/${testRoomOne.id}/channels/${testRoomOneChannelOne.id}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/{room.id}', () => {
    it('204s and deletes room channel', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/channels/${createdRoomChannel.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(204);
          done();
        });
    });

    it('401s when authorized user does not have permission', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/channels/${testRoomOneChannelOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/rooms/${testRoomOne.id}/channels/${testRoomOneChannelOne.id}`);
  });
});
