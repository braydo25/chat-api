const helpers = require('../../helpers');

describe('Conversation Messages', () => {
  let scopedConversationMessage = null;

  /*
   * POST
   */

  describe('POST /conversations/:conversationId/messages', () => {
    it('200s with created conversation message object', done => {
      const fields = {
        text: 'No, this is a mcdonalds',
      };

      chai.request(server)
        .post(`/conversations/${testConversationOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.text.should.equal(fields.text);
          scopedConversationMessage = response.body;
          done();
          helpers.logExampleResponse(response);
        });
    });

    it('400s when not provided content', done => {
      chai.request(server)
        .post(`/conversations/${testConversationOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(400);
          done();
          helpers.logExampleResponse(response);
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', `/conversations/${testConversationOne.id}/messages`);
  });

  /*
   * GET
   */

  describe('GET /conversations/:conversationId/messages', () => {
    it('200s with an array of conversation message objects', done => {
      chai.request(server)
        .get(`/conversations/${testConversationOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(conversationMessage => {
            conversationMessage.should.have.property('user');
            conversationMessage.should.have.property('createdAt');
            conversationMessage.should.have.property('updatedAt');
            conversationMessage.user.should.have.property('id');
            conversationMessage.user.should.have.property('firstName');
            conversationMessage.user.should.have.property('lastName');
          });
          done();
          helpers.logExampleResponse(response);
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', `/conversations/${testConversationOne.id}/messages`);
  });

  /*
   * PATCH
   */

  describe('PATCH /conversations/:conversationId/messages', () => {
    it('200s with updated conversation message object when provided text', done => {
      const fields = {
        text: 'This is a super test',
      };

      chai.request(server)
        .patch(`/conversations/${testConversationOne.id}/messages/${scopedConversationMessage.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.text.should.equal(fields.text);
          response.body.updatedAt.should.not.equal(response.body.createdAt);
          done();
          helpers.logExampleResponse(response);
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/conversations/${testConversationOne.id}/messages`);
  });

  /*
   * DELETE
   */

  describe('DELETE /conversations/:conversationId/messages', () => {
    it('204s and deletes conversation message', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/messages/${scopedConversationMessage.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(204);
          done();
          helpers.logExampleResponse(response);
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/conversations/${testConversationOne.id}/messages`);
  });
});
