const helpers = require('../../helpers');

describe('User Conversations', () => {
  /*
   * GET
   */

  it('200s with an array of conversations for authenticated user', done => {
    chai.request(server)
      .get(`/users/${testUserOne.id}/conversations`)
      .set('X-Access-Token', testUserOne.accessToken)
      .end((error, response) => {
        helpers.logExampleResponse(response);
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.forEach(conversation => {
          conversation.userId.should.equal(testUserOne.id);
          conversation.conversationMessages.should.be.an('array');
          conversation.conversationUsers.should.be.an('array');
          conversation.user.should.be.an('object');
        });
        done();
      });
  });

  helpers.it401sWhenUserAuthorizationIsInvalid('get', `/users/${testUserOne.id}/conversations`);
});
