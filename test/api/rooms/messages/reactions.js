const helpers = require('../../../helpers');

describe('Room Message Reactions', () => {
  let scopedRoomMessageReaction = null;

  /*
   * PUT
   */

  describe('PUT /rooms/:roomId/messages/:roomMessageId/reactions', () => {
    it('200s with created room message reaction object and is reflected in message reaction totals', done => {
      const fields = {
        reaction: '🔥🔥🔥',
      };

      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.roomMessageId.should.equal(testRoomOneMessageOne.id);
          response.body.reaction.should.equal(fields.reaction);
          scopedRoomMessageReaction = response.body;

          chai.request(server)
            .put(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
            .set('X-Access-Token', testUserTwo.accessToken)
            .send(fields)
            .end((error, response) => {
              helpers.logExampleResponse(response);
              response.should.have.status(200);
              response.body.should.be.an('object');
              response.body.id.should.not.equal(scopedRoomMessageReaction.id);
              response.body.userId.should.equal(testUserTwo.id);
              response.body.roomMessageId.should.equal(testRoomOneMessageOne.id);
              response.body.reaction.should.equal(fields.reaction);

              chai.request(server)
                .get(`/rooms/${testRoomOne.id}/messages`)
                .set('X-Access-Token', testUserOne.accessToken)
                .end((error, response) => {
                  response.should.have.status(200);
                  const message = response.body.find(message => {
                    return message.id === testRoomOneMessageOne.id;
                  });
                  message.roomMessageReactions.should.deep.include({
                    reaction: fields.reaction,
                    count: 2,
                  });
                  message.authUserRoomMessageReactions.length.should.be.at.least(1);
                  done();
                });
            });
        });
    });

    it('200s with an already existing room message reaction object', done => {
      const fields = {
        reaction: '🔥🔥🔥',
      };

      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedRoomMessageReaction.id);
          done();
        });
    });

    it('200s with created room message reaction and adds authenticated user as room user when user is not a room user', done => {
      const fields = {
        reaction: '🐻',
      };

      chai.request(server)
        .put(`/rooms/${testPermissionsPublicRoom.id}/messages/5/reactions`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          chai.request(server)
            .get(`/rooms/${testPermissionsPublicRoom.id}/users`)
            .set('X-Access-Token', testUserTwo.accessToken)
            .end((error, response) => {
              let userAddedToRoom = false;

              response.body.forEach(roomUser => {
                if (roomUser.user.id === testUserTwo.id) {
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

    it('200s with new room reaction message object when user has already reacted with a different reaction', done => {
      const fields = {
        reaction: '🍚',
      };

      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.reaction.should.equal(fields.reaction);
          done();
        });
    });

    it('400s when room message reaction content is greater than 3 characters', done => {
      const fields = {
        reaction: '🔥🔥🔥🔥',
      };

      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGE_REACTIONS_CREATE permission for room with private access level', done => {
      const fields = {
        reaction: 'kek',
      };

      chai.request(server)
        .put(`/rooms/${testPermissionsPrivateRoom.id}/messages/${testPermissionsPrivateRoomMessageOne.id}/reactions`)
        .set('X-Access-Token', testPermissionsPrivateRoomPermissionlessUser.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/rooms/1/messages/1/reactions');
  });

  /*
   * GET
   */

  describe('GET /rooms/:roomId/messages/:roomMessageId/reactions', () => {
    it('200s with an array of room message reactions when provided reaction', done => {
      chai.request(server)
        .get(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
        .query({ reaction: '🔥🔥🔥' })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(roomMessageReaction => {
            roomMessageReaction.should.have.property('id');
            roomMessageReaction.should.have.property('reaction');
            roomMessageReaction.should.have.property('createdAt');
            roomMessageReaction.should.have.property('user');
          });
          done();
        });
    });

    it('403s when requesting user does not have ROOM_MESSAGE_REACTIONS_READ permission for room with private access level', done => {
      chai.request(server)
        .get(`/rooms/${testPermissionsPrivateRoom.id}/messages/${testPermissionsPrivateRoomMessageOne.id}/reactions`)
        .set('X-Access-Token', testPermissionsPrivateRoomPermissionlessUser.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', `/rooms/1/messages/1/reactions?reaction=${encodeURI('🔥🔥🔥')}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/:roomId/messages/:roomMessageId/reactions', () => {
    it('204s and deletes room message reaction and is reflected in message reaction totals', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions/${scopedRoomMessageReaction.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);

          chai.request(server)
            .get(`/rooms/${testRoomOne.id}/messages`)
            .set('X-Access-Token', testUserOne.accessToken)
            .end((error, response) => {
              response.should.have.status(200);
              response.body.find(message => {
                return message.id === testRoomOneMessageOne.id;
              }).roomMessageReactions.should.deep.include({
                reaction: scopedRoomMessageReaction.reaction,
                count: 1,
              });
              done();
            });
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/rooms/1/messages/1/reactions/1');
  });
});
