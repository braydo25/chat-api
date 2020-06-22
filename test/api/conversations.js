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
          response.body.should.have.property('eventsToken');
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.title.should.equal(fields.title);
          response.body.previewConversationMessage.should.be.an('object');
          response.body.previewConversationUsers.should.be.an('array');
          response.body.conversationMessages.should.be.an('array');
          response.body.conversationMessages[0].userId.should.equal(testUserOne.id);
          response.body.conversationMessages[0].text.should.equal(fields.message.text);
          response.body.should.have.property('authConversationUser');
          scopedConversation = response.body;
          done();
        });
    });

    it('200s with created conversation object when provided users, attachments and embeds', done => {
      const fields = {
        accessLevel: 'protected',
        title: 'Check out my latest stuff!',
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
          response.body.should.have.property('eventsToken');
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.previewConversationMessage.should.be.an('object');
          response.body.previewConversationUsers.should.be.an('array');
          response.body.conversationMessages.should.be.an('array');
          response.body.conversationMessages[0].userId.should.equal(testUserOne.id);
          response.body.conversationMessages[0].attachments.should.be.an('array');
          response.body.conversationMessages[0].attachments[0].id.should.equal(testAttachmentOne.id);
          response.body.conversationMessages[0].embeds.should.be.an('array');
          response.body.conversationMessages[0].embeds[0].id.should.equal(testEmbedOne.id);
          response.body.should.have.property('authConversationUser');
          done();
        });
    });

    it('400s when not provided title for protected or public conversation', done => {
      const fields = {
        accessLevel: 'public',
        message: {
          text: 'yo yo yo',
          nonce: '13y13g13g',
        },
      };

      chai.request(server)
        .post('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(400);
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
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('id');
          response.body.should.have.property('eventsToken');
          response.body.should.have.property('accessLevel');
          response.body.should.have.property('createdAt');
          response.body.conversationMessages.should.be.an('array');
          response.body.conversationMessages.forEach(conversationMessage => {
            conversationMessage.should.have.property('id');
            conversationMessage.should.have.property('text');
            conversationMessage.should.have.property('userId');
            conversationMessage.should.have.property('conversationId');
            conversationMessage.should.have.property('nonce');
            conversationMessage.should.have.property('attachments');
            conversationMessage.should.have.property('embeds');
            conversationMessage.should.have.property('user');
            conversationMessage.should.have.property('conversationMessageReactions');
            conversationMessage.should.have.property('authUserConversationMessageReactions');
            conversationMessage.should.have.property('createdAt');
          });
          response.body.user.should.be.an('object');
          response.body.authConversationUser.should.have.property('id');
          response.body.authConversationUser.should.have.property('permissions');
          done();
        });
    });

    it('200s with an array of recent conversations for the provided access levels the authenticated user is a part of', done => {
      chai.request(server)
        .get(`/conversations?accessLevels=${encodeURIComponent(JSON.stringify([ 'public', 'protected' ]))}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            conversation.should.have.property('eventsToken');
            conversation.accessLevel.should.satisfy(accessLevel => (
              [ 'public', 'protected' ].includes(accessLevel)
            ));
            conversation.impressionsCount.should.be.a('number');
            conversation.previewConversationMessage.should.be.an('object');
            conversation.previewConversationUsers.should.be.an('array');
            conversation.user.should.be.an('object');
          });
          done();
        });
    });

    it('200s with an array of recent conversations started by users the authenticated user follows', done => {
      chai.request(server)
        .get('/conversations?feed=true')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            conversation.should.have.property('eventsToken');
            conversation.impressionsCount.should.be.a('number');
            conversation.previewConversationMessage.should.be.an('object');
            conversation.previewConversationUsers.should.be.an('array');
            conversation.user.should.be.an('object');
          });
          done();
        });
    });

    it('200s with conversation object when provided user ids that are a part of existing conversation that includes authenticated user', done => {
      chai.request(server)
        .get(`/conversations?privateUserIds=${encodeURIComponent(JSON.stringify(testPermissionsPrivateConversation.users))}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('eventsToken');
          response.body.id.should.equal(testPermissionsPrivateConversation.id);
          done();
        });
    });

    it('200s with an array of relevant conversations for the authenticated user', done => {
      chai.request(server)
        .get('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            conversation.should.have.property('eventsToken');
            conversation.impressionsCount.should.be.a('number');
            conversation.previewConversationMessage.should.be.an('object');
            conversation.previewConversationUsers.should.be.an('array');
            conversation.user.should.be.an('object');
          });
          done();
        });
    });

    it('200s with an array of conversation objects when provided search', done => {
      chai.request(server)
        .get('/conversations')
        .query({ search: 'test' })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            conversation.should.have.property('id');
            conversation.should.have.property('eventsToken');
            conversation.should.have.property('accessLevel');
            conversation.should.have.property('title');
            conversation.should.have.property('impressionsCount');
            conversation.should.have.property('usersCount');
            conversation.should.have.property('updatedAt');
            conversation.should.have.property('createdAt');
            conversation.should.have.property('previewConversationMessage');
            conversation.should.have.property('previewConversationUsers');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/conversations');
    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/conversations/1');
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
