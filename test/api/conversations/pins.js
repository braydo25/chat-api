const helpers = require('../../helpers');

describe('Conversation Pins', () => {
  /*
   * PUT
   */

  describe('PUT /conversations/:conversationId/pins/:conversationMessageId', () => {
    it('200s with pinned conversation message object', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/pins/${testConversationOneMessageOne.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.pinnedAt.should.not.equal(null);

          chai.request(server)
            .get(`/conversations/${testConversationOne.id}`)
            .set('X-Access-Token', testUserOne.accessToken)
            .end((error, response) => {
              response.body.should.have.property('pinnedConversationMessages');
              response.body.pinnedConversationMessages.length.should.be.at.least(1);
              done();
            });
        });
    });

    it('403s when requesting user does not have CONVERSATION_MESSAGE_PIN_CREATE permission', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/pins/${testConversationOneMessageOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/conversations/1/pins/1');
  });

  /*
   * DELETE
   */

  describe('DELETE /conversations/:conversationId/pins/:conversationMessageId', () => {
    it('200s with unpinned conversation message object', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/pins/${testConversationOneMessageOne.id}`)
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
        .delete(`/conversations/${testConversationOne.id}/pins/${testConversationOneMessageOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/conversations/1/pins/1');
  });
});
