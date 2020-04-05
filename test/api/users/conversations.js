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
        response.body.length.should.be.at.least(1);
        response.body.forEach(conversation => {
          conversation.userId.should.equal(testUserOne.id);
          conversation.conversationMessages.should.be.an('array');
          conversation.conversationUsers.should.be.an('array');
          conversation.user.should.be.an('object');
        });
        done();
      });
  });

  it('200s with an array of public conversations for provided userId', done => {
    chai.request(server)
      .get(`/users/${testUserTwo.id}/conversations`)
      .set('X-Access-Token', testUserOne.accessToken)
      .end((error, response) => {
        helpers.logExampleResponse(response);
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.length.should.be.at.least(1);
        response.body.forEach(conversation => {
          conversation.permission.should.equal('public');
          conversation.userId.should.equal(testUserTwo.id);
          conversation.conversationMessages.should.be.an('array');
          conversation.conversationUsers.should.be.an('array');
          conversation.user.should.be.an('object');
        });
        done();
      });
  });

  helpers.it401sWhenUserAuthorizationIsInvalid('get', `/users/${testUserOne.id}/conversations`);
});
