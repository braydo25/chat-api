const helpers = require('../helpers');

describe('Conversations', () => {
  let scopedConversation = null;

  /*
   * POST
   */

  describe('POST /conversations', () => {
    it('200s with created conversation object', done => {
      const fields = {
        accessLevel: 'public',
        title: 'Testing this convo!!',
        message: {
          text: 'test test test!',
          nonce: '11h1h1h1h111',
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
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.title.should.equal(fields.title);
          response.body.previewConversationMessage.should.be.an('object');
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
        accessLevel: 'protected',
        message: {
          attachments: [ testAttachmentOne.id ],
          embeds: [ testEmbedOne.id ],
          nonce: 'yoyoyoyo',
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
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.previewConversationMessage.should.be.an('object');
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
        accessLevel: 'public',
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

    it('409s with already existing private conversation object when provided users of already existing private conversation', done => {
      const fields = {
        accessLevel: 'private',
        users: [
          testPermissionsPrivateConversationAdminUser.id,
          testPermissionsPrivateConversationGeneralUser.id,
          testPermissionsPrivateConversationPermissionlessUser.id,
        ],
      };

      chai.request(server)
        .post('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(409);
          response.body.should.be.an('object');
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/conversations');
  });

  /*
   * GET
   */

  describe('GET /conversations', () => {
    it('200s with conversation object when provided conversation id', done => {
      chai.request(server)
        .get(`/conversations/${scopedConversation.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('id');
          response.body.should.have.property('accessLevel');
          response.body.should.have.property('createdAt');
          response.body.conversationMessages.should.be.an('array');
          response.body.conversationUsers.should.be.an('array');
          response.body.user.should.be.an('object');
          done();
        });
    });

    it('200s with conversation object when provided user ids that are a part of existing conversation that includes authenticated user', done => {
      console.log(testPermissionsPrivateConversation);
      chai.request(server)
        .get(`/conversations?privateUserIds=${encodeURIComponent(JSON.stringify(testPermissionsPrivateConversation.users))}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(testPermissionsPrivateConversation.id);
          done();
        });
    });

    it('200s with an array of conversation objects the user is a part of', done => {
      chai.request(server)
        .get('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            conversation.impressionsCount.should.be.a('number');
            conversation.previewConversationMessage.should.be.an('object');
            conversation.conversationMessages.should.be.an('array');
            conversation.conversationUsers.should.be.an('array');
            conversation.user.should.be.an('object');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/conversations');
  });

  /*
   * PATCH
   */

  describe('PATCH /conversations', () => {
    it('200s with updated conversation object', done => {
      const fields = {
        accessLevel: 'private',
        title: 'Private message title test',
      };

      chai.request(server)
        .patch(`/conversations/${scopedConversation.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.title.should.equal(fields.title);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/conversations/1');
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

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/conversations/1');
  });
});
