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
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.text.should.equal(fields.text);
          scopedConversationMessage = response.body;
          done();
        });
    });

    it('200s with created conversation message object when provided attachments or embeds', done => {
      const fields = {
        attachments: [ testAttachmentOne.id ],
        embeds: [ testEmbedOne.id ],
      };

      chai.request(server)
        .post(`/conversations/${testConversationOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.attachments.should.be.an('array');
          response.body.attachments[0].id.should.equal(testAttachmentOne.id);
          response.body.embeds.should.be.an('array');
          response.body.embeds[0].id.should.equal(testEmbedOne.id);
          done();
        });
    });

    it('400s when not provided content', done => {
      chai.request(server)
        .post(`/conversations/${testConversationOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
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
          helpers.logExampleResponse(response);
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
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.text.should.equal(fields.text);
          response.body.updatedAt.should.not.equal(response.body.createdAt);
          done();
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
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/conversations/${testConversationOne.id}/messages`);
  });
});
