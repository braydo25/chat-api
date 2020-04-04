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

    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/conversations/${testConversationOne.id}/typing`);
  });
});
