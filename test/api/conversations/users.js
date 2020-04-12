const helpers = require('../../helpers');

describe('Conversation Users', () => {
  let scopedConversationUser = null;

  /*
   * PUT
   */

  describe('PUT /conversations/:conversationId/users', () => {
    it('200s with created conversation user object', done => {
      const fields = {
        userId: testUserThree.id,
      };

      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.conversationId.should.equal(testConversationOne.id);
          response.body.userId.should.equal(fields.userId);
          scopedConversationUser = response.body;
          done();
        });
    });

    it('200s with existing conversation user object', done => {
      const fields = {
        userId: scopedConversationUser.userId,
      };

      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedConversationUser.id);
          done();
        });
    });

    it('400s when not provided a user id', done => {
      chai.request(server)
        .put(`/conversations/${testConversationOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', `/conversations/${testConversationOne.id}/users`);
  });

  /*
   * GET
   */

  describe('GET /conversations/:conversationId/users', () => {
    it('200s with an array of conversation user objects', done => {
      chai.request(server)
        .get(`/conversations/${testConversationOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversationUser => {
            conversationUser.should.have.property('user');
            conversationUser.user.should.have.property('id');
            conversationUser.user.should.have.property('name');
            conversationUser.user.should.have.property('username');
            conversationUser.user.should.have.property('avatarAttachment');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', `/conversations/${testConversationOne.id}/users`);
  });

  /*
   * PATCH
   */

  describe('PATCH /conversations/:conversationId/users', () => {
    it('200s with updated conversation user object when provided permissions', done => {
      const fields = {
        permissions: [
          'CONVERSATION_MESSAGES_CREATE',
          'CONVERSATION_MESSAGES_READ',
        ],
      };

      chai.request(server)
        .patch(`/conversations/${testConversationOne.id}/users/${testConversationOneUserOne.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.permissions.should.deep.equal(fields.permissions);
          done();
        });
    });

    it('403s when requesting user does not have permission to modify conversation users', done => {
      const fields = {
        permissions: [
          'CONVERSATION_MESSAGES_READ',
        ],
      };

      chai.request(server)
        .patch(`/conversations/${testConversationOne.id}/users/${scopedConversationUser.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/conversations/${testConversationOne.id}/users/${testConversationOneUserOne.id}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /conversations/:conversationId/users', () => {
    it('204s and deletes conversation user', done => {
      chai.request(server)
        .delete(`/conversations/${testConversationOne.id}/users/${scopedConversationUser.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/conversations/${testConversationOne.id}/users`);
  });
});
