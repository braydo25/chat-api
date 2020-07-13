const helpers = require('../../helpers');

describe('Conversation Reposts', () => {
  let scopedConversationRepost = null;

  /*
   * PUT
   */

  describe('PUT /conversations/:conversationId/reposts', () => {
    it('200s with created conversation repost object', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/reposts`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          scopedConversationRepost = response.body;
          done();
        });
    });

    it('200s with existing conversation repost object', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/reposts`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedConversationRepost.id);
          done();
        });
    });

    it('400s when requesting user is creator of conversation', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/reposts`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/conversations/1/reposts');
  });

  /*
   * DELETE
   */

  describe('DELETE /conversation/:conversationId/reposts/:conversationRepostId', () => {
    it('204s and deletes conversation repost', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/reposts/${scopedConversationRepost.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/conversations/1/reposts/1');
  });
});
