const helpers = require('../../helpers');

describe('User Conversations', () => {
  /*
   * GET
   */

  it('200s with an array of conversation objects for authenticated user', done => {
    chai.request(server)
      .get(`/users/${testUserOne.id}/conversations`)
      .set('X-Access-Token', testUserOne.accessToken)
      .end((error, response) => {
        helpers.logExampleResponse(response);
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.length.should.be.at.least(1);
        response.body.forEach(conversation => {
          conversation.user.should.be.an('object');
          conversation.user.id.should.equal(testUserOne.id);
        });
        done();
      });
  });

  it('200s with an array of public conversation objects for provided userId', done => {
    chai.request(server)
      .get(`/users/${testUserThree.id}/conversations`)
      .set('X-Access-Token', testUserOne.accessToken)
      .end((error, response) => {
        helpers.logExampleResponse(response);
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.length.should.be.at.least(1);
        response.body.forEach(conversation => {
          conversation.accessLevel.should.not.equal('private');
          conversation.user.should.be.an('object');
          conversation.user.id.should.equal(testUserThree.id);
        });
        done();
      });
  });

  helpers.it401sWhenUserAuthorizationIsInvalid('get', '/users/1/conversations');
});
