const helpers = require('../../helpers');

describe('Conversation Typing', () => {
  /*
   * POST
   */

  describe('POST /conversations/:conversationId/typing', () => {
    it('204s and dispatches MQTT typing event', done => {
      chai.request(server)
        .post(`/conversations/${testConversationOne.id}/typing`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          // todo: check for event.
          done();
        });
    });

    it('403s when requesting user does not have CONVERSATION_MESSAGES_WRITE permission for conversation with any access level', done => {
      chai.request(server)
        .post(`/conversations/${testPermissionsProtectedConversation.id}/typing`)
        .set('X-Access-Token', testPermissionsProtectedConversationPermissionlessUser.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/conversations/${testConversationOne.id}/typing`);
  });
});
