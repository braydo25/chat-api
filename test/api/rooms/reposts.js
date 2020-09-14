const helpers = require('../../helpers');

describe('Room Reposts', () => {
  /*
   * PUT
   */

  describe('PUT /rooms/:roomId/reposts', () => {
    let scopedRoomRepost = null;

    it('200s with created room repost object', done => {
      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/reposts`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          scopedRoomRepost = response.body;
          done();
        });
    });

    it('200s with existing room repost object', done => {
      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/reposts`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedRoomRepost.id);
          done();
        });
    });

    it('400s when requesting user is creator of room', done => {
      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/reposts`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/rooms/1/reposts');
  });

  /*
   * DELETE
   */

  describe('DELETE /room/:roomId/reposts/:roomRepostId', () => {
    it('204s and deletes room repost', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/reposts`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/rooms/1/reposts/1');
  });
});
