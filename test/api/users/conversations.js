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
          conversation.conversationMessages.should.be.an('array');
          conversation.conversationUsers.should.be.an('array');
          conversation.user.should.be.an('object');
          conversation.user.id.should.equal(testUserOne.id);
        });
        done();
      });
  });

  it('200s with an array of public conversation objects for provided userId', done => {
    chai.request(server)
      .get(`/users/${testUserTwo.id}/conversations`)
      .set('X-Access-Token', testUserOne.accessToken)
      .end((error, response) => {
        helpers.logExampleResponse(response);
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.length.should.be.at.least(1);
        response.body.forEach(conversation => {
          conversation.permission.should.not.equal('private');
          conversation.conversationMessages.should.be.an('array');
          conversation.conversationUsers.should.be.an('array');
          conversation.user.should.be.an('object');
          conversation.user.id.should.equal(testUserTwo.id);
        });
        done();
      });
  });

  helpers.it401sWhenUserAuthorizationIsInvalid('get', `/users/${testUserOne.id}/conversations`);
});
