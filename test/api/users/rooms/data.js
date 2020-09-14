const helpers = require('../../../helpers');

describe('User Converstion Data', () => {
  /*
   * PUT
   */

  describe('PUT /users/:userId/rooms/:roomId/data', () => {
    let scopedUserRoomData = null;

    it('200s with a user room data object', done => {
      chai.request(server)
        .put(`/users/me/rooms/${testRoomTwo.id}/data`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.roomId.should.equal(testRoomTwo.id);
          response.body.should.have.property('lastReadAt');
          scopedUserRoomData = response.body;
          done();
        });
    });

    it('200s with an updated existing user room data object', done => {
      chai.request(server)
        .put(`/users/me/rooms/${testRoomTwo.id}/data`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedUserRoomData.id);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/users/1/rooms/1/data');
  });
});
