const helpers = require('../../../helpers');

describe('User Converstion Data', () => {
  /*
   * PUT
   */

  describe('PUT /users/:userId/conversations/:conversationId/data', () => {
    let scopedUserConversationData = null;

    it('200s with a user conversation data object', done => {
      chai.request(server)
        .put(`/users/me/conversations/${testConversationTwo.id}/data`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.conversationId.should.equal(testConversationTwo.id);
          response.body.should.have.property('lastReadAt');
          scopedUserConversationData = response.body;
          done();
        });
    });

    it('200s with an updated existing user conversation data object', done => {
      chai.request(server)
        .put(`/users/me/conversations/${testConversationTwo.id}/data`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedUserConversationData.id);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/users/1/conversations/1/data');
  });
});
