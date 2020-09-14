const helpers = require('../../helpers');

describe('Room Pins', () => {
  /*
   * PUT
   */

  describe('PUT /rooms/:roomId/pins/:roomMessageId', () => {
    it('200s with pinned room message object', done => {
      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/pins/${testRoomOneMessageOne.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.pinnedAt.should.not.equal(null);

          chai.request(server)
            .get(`/rooms/${testRoomOne.id}`)
            .set('X-Access-Token', testUserOne.accessToken)
            .end((error, response) => {
              response.body.should.have.property('pinnedRoomMessages');
              response.body.pinnedRoomMessages.length.should.be.at.least(1);
              done();
            });
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGE_PIN_CREATE permission', done => {
      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/pins/${testRoomOneMessageOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/rooms/1/pins/1');
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/:roomId/pins/:roomMessageId', () => {
    it('204s and unpins room message', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/pins/${testRoomOneMessageOne.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGE_PIN_DELETE permission', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/pins/${testRoomOneMessageOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/rooms/1/pins/1');
  });
});
