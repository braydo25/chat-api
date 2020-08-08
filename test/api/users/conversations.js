const helpers = require('../../helpers');

describe('User Conversations', () => {
  /*
   * GET
   */

  describe('GET /users/:userId/conversations', () => {
    it('200s with an array of public and protected conversation and conversation repost objects for provided userId', done => {
      chai.request(server)
        .get(`/users/${testUserThree.id}/conversations`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            conversation.accessLevel.should.not.equal('private');
            conversation.should.have.property('eventsTopic');
            conversation.user.should.be.an('object');
            if (conversation.conversationRepostId) {
              conversation.conversationRepostUser.id.should.equal(testUserThree.id);
            } else {
              conversation.user.id.should.equal(testUserThree.id);
            }
          });
          done();
        });
    });

    it('200s with an array of converasations before provided conversation createdAt datetime', done => {
      chai.request(server)
        .get(`/users/${testUserOne.id}/conversations`)
        .query({ before: testPermissionsPublicConversation.createdAt })
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            if ((new Date(conversation.createdAt)).getTime() >= (new Date(testPermissionsPublicConversation.createdAt)).getTime()) {
              throw Error('Expected conversation updated at to be older than provided before date.');
            }
          });
          done();
        });
    });

    it('200s with an array of converasations after provided conversation createdAt datetime', done => {
      chai.request(server)
        .get(`/users/${testUserOne.id}/conversations`)
        .query({ after: testConversationOne.createdAt })
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(conversation => {
            if ((new Date(conversation.createdAt)).getTime() <= (new Date(testConversationOne.createdAt)).getTime()) {
              throw Error('Expected conversation updated at to be newer than provided after date.');
            }
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/users/1/conversations');
  });

  /*
   * DELETE
   */

  describe('DELETE /users/me/conversations/:conversationId', () => {
    it('204s and deletes conversation user', done => {
      chai.request(server)
        .delete(`/users/me/conversations/${testConversationTwo.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/users/me/conversations/1');
  });
});
