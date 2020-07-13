const helpers = require('../../../helpers');

describe('Conversation Message Pin', () => {
  /*
   * PUT
   */

  describe('PUT /conversations/:conversationId/messages/:conversationMessageId/pin', () => {
    it('200s with pinned conversation message object', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/pin`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.pinnedAt.should.not.equal(null);
          done();
        });
    });

    it('403s when requesting user does not have CONVERSATION_MESSAGE_PIN_CREATE permission', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/pin`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/conversations/1/messages/1/pin');
  });

  /*
   * DELETE
   */

  describe('DELETE /conversations/:conversationId/messages/:conversationMessageId/pin', () => {
    it('200s with unpinned conversation message object', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/pin`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          if (response.body.pinnedAt) {
            throw new Error('expected pinnedAt to be null');
          }
          done();
        });
    });

    it('403s when requesting user does not have CONVERSATION_MESSAGE_PIN_DELETE permission', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/pin`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/conversations/1/messages/1/pin');
  });
});
