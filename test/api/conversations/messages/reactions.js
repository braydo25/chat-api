const helpers = require('../../../helpers');

describe('Conversation Message Reactions', () => {
  let scopedConversationMessageReaction = null;

  /*
   * PUT
   */

  describe('PUT /conversations/:conversationId/messages/:conversationMessageId/reactions', () => {
    it('200s with created conversation message reaction object and is reflected in message reaction totals', done => {
      const fields = {
        reaction: '🔥🔥🔥',
      };

      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.conversationMessageId.should.equal(testConversationOneMessageOne.id);
          response.body.reaction.should.equal(fields.reaction);
          scopedConversationMessageReaction = response.body;

          chai.request(server)
            .get(`/conversations/${testConversationOne.id}/messages`)
            .set('X-Access-Token', testUserOne.accessToken)
            .end((error, response) => {
              response.should.have.status(200);
              console.log(response.body.find(message => {
                return message.id === testConversationOneMessageOne.id;
              }));
              response.body.find(message => {
                return message.id === testConversationOneMessageOne.id;
              }).conversationMessageReactions.should.deep.include({
                reaction: fields.reaction,
                count: 1,
              });
              done();
            });
        });
    });

    it('200s with an already existing conversation message reaction object', done => {
      const fields = {
        reaction: '🔥🔥🔥',
      };

      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedConversationMessageReaction.id);
          done();
        });
    });

    it('400s when conversation message reaction content is greater than 3 characters', done => {
      const fields = {
        reaction: '🔥🔥🔥🔥',
      };

      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', `/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions`);
  });

  /*
   * DELETE
   */

  describe('DELETE /conversations/:conversationId/messages/:conversationMessageId/reactions', () => {
    it('204s and deletes conversation message reaction', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions/${scopedConversationMessageReaction.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions`);
  });
});
