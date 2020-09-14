const helpers = require('../../helpers');

describe('Room Messages', () => {
  let scopedRoomMessage = null;

  /*
   * POST
   */

  describe('POST /rooms/:roomId/messages', () => {
    it('200s with created room message object', done => {
      const fields = {
        text: 'No, this is a mcdonalds',
        nonce: 'fe0d0354-9796-11ea-bb37-0242ac130002',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.roomUser.userId.should.equal(testUserOne.id);
          response.body.text.should.equal(fields.text);
          response.body.nonce.should.equal(fields.nonce);
          scopedRoomMessage = response.body;
          done();
        });
    });

    it('200s with created room message object when provided attachments or embeds', done => {
      const fields = {
        attachmentIds: [ testAttachmentOne.id ],
        embedIds: [ testEmbedOne.id ],
        nonce: 'attachio12412',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.roomUser.userId.should.equal(testUserOne.id);
          response.body.roomUser.user.should.be.an('object');
          response.body.attachments.should.be.an('array');
          response.body.attachments[0].id.should.equal(testAttachmentOne.id);
          response.body.embeds.should.be.an('array');
          response.body.embeds[0].id.should.equal(testEmbedOne.id);
          done();
        });
    });

    it('200s with created room message object and adds authenticated user as room user when user is not a room user', done => {
      const fields = {
        text: 'hey there',
        nonce: 'deadlockbstest',
      };

      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/messages`)
        .set('X-Access-Token', testUserFour.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.roomUser.should.be.an('object');
          response.body.roomUser.user.should.be.an('object');
          chai.request(server)
            .get(`/rooms/${testRoomOne.id}/users`)
            .set('X-Access-Token', testUserFour.accessToken)
            .end((error, response) => {
              let userAddedToRoom = false;

              response.body.forEach(roomUser => {
                if (roomUser.user.id === testUserFour.id) {
                  userAddedToRoom = true;
                }
              });

              if (!userAddedToRoom) {
                throw new Error('User was not added to room.');
              }

              done();
            });
        });
    });

    it('400s when not provided content', done => {
      chai.request(server)
        .post(`/rooms/${testRoomOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGES_CREATE permission for room with any access level', done => {
      const fields = {
        text: 'this is a test',
      };

      chai.request(server)
        .post(`/rooms/${testPermissionsPublicRoom.id}/messages`)
        .set('X-Access-Token', testPermissionsPublicRoomPermissionlessUser.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/rooms/1/messages');
  });

  /*
   * GET
   */

  describe('GET /rooms/:roomId/messages', () => {
    it('200s with an array of room message objects', done => {
      chai.request(server)
        .get(`/rooms/${testRoomOne.id}/messages`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(roomMessage => {
            roomMessage.should.have.property('id');
            roomMessage.should.have.property('roomId');
            roomMessage.should.have.property('roomUser');
            roomMessage.should.have.property('roomMessageReactions');
            roomMessage.should.have.property('authUserRoomMessageReactions');
            roomMessage.should.have.property('createdAt');
            roomMessage.should.have.property('updatedAt');
            roomMessage.roomUser.permissions.should.be.an('array');
            roomMessage.roomUser.user.should.have.property('id');
            roomMessage.roomUser.user.should.have.property('name');
            roomMessage.roomUser.user.should.have.property('username');
            roomMessage.roomUser.user.should.have.property('avatarAttachment');
          });
          done();
        });
    });

    it('200s with an array of room message objects before provided room message id', done => {
      chai.request(server)
        .get(`/rooms/${testRoomOne.id}/messages`)
        .query({ before: scopedRoomMessage.createdAt })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(roomMessage => {
            if ((new Date(roomMessage.createdAt)).getTime() >= (new Date(scopedRoomMessage.createdAt)).getTime()) {
              throw Error('Expected room updated at to be older than provided before date.');
            }
          });
          done();
        });
    });

    it('200s with an array of room message objects after provided room message id', done => {
      chai.request(server)
        .get(`/rooms/${testRoomOne.id}/messages`)
        .query({ after: testRoomOneMessageOne.createdAt })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(roomMessage => {
            if ((new Date(roomMessage.createdAt)).getTime() <= (new Date(testRoomOneMessageOne.createdAt)).getTime()) {
              throw Error('Expected room updated at to be newer than provided after date.');
            }
          });
          done();
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGES_READ permission for room with private access level', done => {
      chai.request(server)
        .get(`/rooms/${testPermissionsPrivateRoom.id}/messages`)
        .set('X-Access-Token', testPermissionsPrivateRoomPermissionlessUser.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/rooms/1/messages');
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms/:roomId/messages', () => {
    it('200s with updated room message object when provided text', done => {
      const fields = {
        text: 'This is a super test',
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/messages/${scopedRoomMessage.id}`)
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

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/rooms/1/messages');
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/:roomId/messages', () => {
    it('204s and deletes room message', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/messages/${scopedRoomMessage.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/rooms/1/messages/1');
  });
});
