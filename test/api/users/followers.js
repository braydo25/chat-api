const helpers = require('../../helpers');

describe('User Followers', () => {
  let scopedUserFollower = null;

  /*
   * PUT
   */

  describe('PUT /users/:userId/followers', () => {
    it('200s with created user follower object', done => {
      chai.request(server)
        .put(`/users/${testUserTwo.id}/followers`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.be.oneOf([ testUserTwo.id, `${testUserTwo.id}` ]); // TODO: string param in url makes userId (int in db) returned a string, weird.
          response.body.followerUserId.should.equal(testUserOne.id);
          scopedUserFollower = response.body;
          done();
        });
    });

    it('200s with an already existing user follower object', done => {
      chai.request(server)
        .put(`/users/${testUserTwo.id}/followers`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedUserFollower.id);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', `/users/${testUserOne.id}/followers`);
  });

  /*
   * GET
   */

  describe('GET /users/:userId/followers', () => {
    it('200s with an array of user follower objects', done => {
      chai.request(server)
        .get(`/users/${scopedUserFollower.userId}/followers`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(userFollower => {
            userFollower.should.have.property('followerUser');
            userFollower.followerUser.id.should.equal(scopedUserFollower.followerUserId);
            userFollower.followerUser.should.have.property('firstName');
            userFollower.followerUser.should.have.property('lastName');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', `/users/${testUserOne.id}/followers`);
  });

  /*
   * DELETE
   */

  describe('DELETE /users/:userId/followers', () => {
    it('204s and deletes user follower', done => {
      chai.request(server)
        .delete(`/users/${scopedUserFollower.userId}/followers`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/users/${testUserOne.id}/followers`);
  });
});
