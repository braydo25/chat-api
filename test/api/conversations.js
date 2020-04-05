const helpers = require('../helpers');

describe('Conversations', () => {
  let scopedConversation = null;

  /*
   * GET
   */

  describe('GET /conversations', () => {
    it('200s with an array of conversation objects the user is a part of', done => {
      done('todo');
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/conversations');
  });

  /*
   * POST
   */

  describe('POST /conversations', () => {
    it('200s with created conversation object', done => {
      const fields = {
        permission: 'public',
        message: {
          text: 'test test test!',
        },
      };

      chai.request(server)
        .post('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.permission.should.equal(fields.permission),
          response.body.conversationMessages.should.be.an('array');
          response.body.conversationMessages[0].userId.should.equal(testUserOne.id);
          response.body.conversationMessages[0].text.should.equal(fields.message.text);
          response.body.conversationUsers.should.be.an('array');
          response.body.conversationUsers[0].userId.should.equal(testUserOne.id);
          scopedConversation = response.body;
          done();
        });
    });

    it('200s with created conversation object when provided users, attachments and embeds', done => {
      const fields = {
        permission: 'private',
        message: {
          attachments: [ testAttachmentOne.id ],
          embeds: [ testEmbedOne.id ],
        },
        users: [ testUserTwo.id ],
      };

      chai.request(server)
        .post('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.permission.should.equal(fields.permission);
          response.body.conversationMessages.should.be.an('array');
          response.body.conversationMessages[0].userId.should.equal(testUserOne.id);
          response.body.conversationMessages[0].attachments.should.be.an('array');
          response.body.conversationMessages[0].attachments[0].id.should.equal(testAttachmentOne.id);
          response.body.conversationMessages[0].embeds.should.be.an('array');
          response.body.conversationMessages[0].embeds[0].id.should.equal(testEmbedOne.id);
          response.body.conversationUsers.should.be.an('array');
          response.body.conversationUsers[0].userId.should.equal(testUserOne.id);
          response.body.conversationUsers[1].userId.should.equal(testUserTwo.id);
          done();
        });
    });

    it('400s when not provided content for conversationMessage', done => {
      const fields = {
        permission: 'public',
      };

      chai.request(server)
        .post('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/conversations');
  });

  /*
   * PATCH
   */

  describe('PATCH /conversations', () => {
    it('200s with updated conversation object', done => {
      const fields = {
        permission: 'private',
      };

      chai.request(server)
        .patch(`/conversations/${scopedConversation.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.permission.should.equal(fields.permission);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/conversations');
  });

  /*
   * DELETE
   */

  describe('DELETE /conversations', () => {
    it('204s and deletes conversation', done => {
      chai.request(server)
        .delete(`/conversations/${scopedConversation.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/conversations');
  });
});
