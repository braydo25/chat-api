const helpers = require('../../helpers');

describe('Room Typing', () => {
  /*
   * POST
   */

  describe('POST /rooms/:roomId/typing', () => {
    it('204s and dispatches MQTT typing event', done => {
      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/typing`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          // todo: check for event.
          done();
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGES_CREATE permission for room with any access level', done => {
      chai.request(server)
        .post(`/rooms/${testPermissionsProtectedRoom.id}/typing`)
        .set('X-Access-Token', testPermissionsProtectedRoomPermissionlessUser.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/rooms/1/typing');
  });
});
