const helpers = require('../helpers');

describe('Rooms', () => {
  let scopedRoom = null;

  /*
   * POST
   */

  describe('POST /rooms', () => {
    it('200s with created room object', done => {
      const fields = {
        accessLevel: 'public',
        title: 'Testing this convo!!',
        message: {
          text: 'test test test!',
          nonce: '11h1h1h1h111',
        },
        userIds: [ testUserTwo.id ],
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.should.have.property('eventsTopic');
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.title.should.equal(fields.title);
          response.body.previewRoomMessage.should.be.an('object');
          response.body.previewRoomUsers.should.be.an('array');
          response.body.roomMessages.should.be.an('array');
          response.body.roomMessages[0].roomUser.userId.should.equal(testUserOne.id);
          response.body.roomMessages[0].text.should.equal(fields.message.text);
          response.body.should.have.property('authRoomUser');
          scopedRoom = response.body;
          mqttConnection.subscribe(response.body.eventsTopic);
          done();
        });
    });

    it('200s with created room object when provided users, attachments and embeds', done => {
      const fields = {
        accessLevel: 'protected',
        title: 'Check out my latest stuff!',
        message: {
          attachmentIds: [ testAttachmentOne.id ],
          embedIds: [ testEmbedOne.id ],
          nonce: 'yoyoyoyo',
        },
        userIds: [ testUserTwo.id ],
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.should.have.property('eventsTopic');
          response.body.accessLevel.should.equal(fields.accessLevel);
          response.body.previewRoomMessage.should.be.an('object');
          response.body.previewRoomUsers.should.be.an('array');
          response.body.roomMessages.should.be.an('array');
          response.body.roomMessages[0].roomUser.userId.should.equal(testUserOne.id);
          response.body.roomMessages[0].attachments.should.be.an('array');
          response.body.roomMessages[0].attachments[0].id.should.equal(testAttachmentOne.id);
          response.body.roomMessages[0].embeds.should.be.an('array');
          response.body.roomMessages[0].embeds[0].id.should.equal(testEmbedOne.id);
          response.body.should.have.property('authRoomUser');
          mqttConnection.subscribe(response.body.eventsTopic);
          done();
        });
    });

    it('200s with created room object and creates new user when provided phone users', done => {
      const fields = {
        accessLevel: 'private',
        title: 'test invite',
        message: {
          text: 'hihi',
          nonce: 'bebebe',
        },
        phoneUsers: [
          {
            name: 'Braydon Batungbacal',
            phone: '12535487446',
          },
        ],
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          done();
        });
    });

    it('400s when not provided title for protected or public room', done => {
      const fields = {
        accessLevel: 'public',
        message: {
          text: 'yo yo yo',
          nonce: '13y13g13g',
        },
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    it('400s when not provided content for roomMessage', done => {
      const fields = {
        accessLevel: 'public',
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('409s with already existing private room object when provided users of already existing private room', done => {
      const fields = {
        accessLevel: 'private',
        userIds: [
          testPermissionsPrivateRoomAdminUser.id,
          testPermissionsPrivateRoomGeneralUser.id,
          testPermissionsPrivateRoomPermissionlessUser.id,
        ],
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(409);
          response.body.should.be.an('object');
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/rooms');
  });

  /*
   * GET
   */

  describe('GET /rooms', () => {
    it('200s with room object when provided room id', done => {
      chai.request(server)
        .get(`/rooms/${scopedRoom.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('id');
          response.body.should.have.property('eventsTopic');
          response.body.should.have.property('accessLevel');
          response.body.should.have.property('lastMessageAt');
          response.body.should.have.property('createdAt');
          response.body.roomMessages.should.be.an('array');
          response.body.roomMessages.forEach(roomMessage => {
            roomMessage.should.have.property('id');
            roomMessage.should.have.property('roomId');
            roomMessage.should.have.property('text');
            roomMessage.should.have.property('roomUser');
            roomMessage.roomUser.should.have.property('permissions');
            roomMessage.roomUser.should.have.property('user');
            roomMessage.should.have.property('roomId');
            roomMessage.should.have.property('nonce');
            roomMessage.should.have.property('attachments');
            roomMessage.should.have.property('embeds');
            roomMessage.should.have.property('roomMessageReactions');
            roomMessage.should.have.property('authUserRoomMessageReactions');
            roomMessage.should.have.property('createdAt');
          });
          response.body.should.have.property('pinnedRoomMessages');
          response.body.user.should.be.an('object');
          response.body.authRoomUser.should.have.property('id');
          response.body.authRoomUser.should.have.property('permissions');
          done();
        });
    });

    it('200s with preview room object when provided room id and preview query parameter', done => {
      chai.request(server)
        .get(`/rooms/${scopedRoom.id}`)
        .query({ preview: true })
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('eventsTopic');
          response.body.accessLevel.should.satisfy(accessLevel => (
            [ 'public', 'protected' ].includes(accessLevel)
          ));
          response.body.impressionsCount.should.be.a('number');
          response.body.previewRoomMessage.should.be.an('object');
          response.body.previewRoomUsers.should.be.an('array');
          response.body.user.should.be.an('object');
          done();
        });
    });

    it('200s with room object and includes authUserRoomRepost when provided room id', done => {
      chai.request(server)
        .put(`/rooms/${testRoomThree.id}/reposts`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          response.should.have.status(200);

          chai.request(server)
            .get(`/rooms/${testRoomThree.id}`)
            .set('X-Access-Token', testUserTwo.accessToken)
            .end((error, response) => {
              helpers.logExampleResponse(response);
              response.should.have.status(200);
              response.body.should.be.an('object');
              response.body.authUserRoomRepost.should.be.an('object');
              done();
            });
        });
    });

    it('200s with an array of recent rooms for the provided access levels the authenticated user is a part of', done => {
      chai.request(server)
        .get(`/rooms?accessLevels=${encodeURIComponent(JSON.stringify([ 'public', 'protected' ]))}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.should.have.property('eventsTopic');
            room.accessLevel.should.satisfy(accessLevel => (
              [ 'public', 'protected' ].includes(accessLevel)
            ));
            room.authRoomUser.should.have.property('id');
            room.authRoomUser.should.have.property('permissions');
            room.impressionsCount.should.be.a('number');
            room.previewRoomMessage.should.be.an('object');
            room.previewRoomUsers.should.be.an('array');
            room.user.should.be.an('object');
          });
          done();
        });
    });

    it('200s with an array of recent rooms started or reposted by users the authenticated user follows', done => {
      chai.request(server)
        .get('/rooms?feed=true')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            const roomTest = room => {
              room.should.have.property('eventsTopic');
              room.impressionsCount.should.be.a('number');
              room.previewRoomMessage.should.be.an('object');
              room.previewRoomUsers.should.be.an('array');
              room.user.should.be.an('object');

            };

            if (!room.room) {
              roomTest(room);
            } else {
              roomTest(room.room); // repost
            }
          });
          done();
        });
    });

    it('200s with an array of rooms before provided room createdAt datetime', done => {
      chai.request(server)
        .get('/rooms')
        .query({ before: scopedRoom.createdAt })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            if ((new Date(room.createdAt)).getTime() >= (new Date(scopedRoom.createdAt)).getTime()) {
              throw Error('Expected room updated at to be older than provided before date.');
            }
          });
          done();
        });
    });

    it('200s with an array of rooms after provided room createdAt datetime', done => {
      chai.request(server)
        .get('/rooms')
        .query({ after: testRoomOne.createdAt })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            if ((new Date(room.createdAt)).getTime() <= (new Date(testRoomOne.createdAt)).getTime()) {
              throw Error('Expected room updated at to be newer than provided after date.');
            }
          });
          done();
        });
    });

    it('200s with an array of rooms updated after provided staler date', done => {
      chai.request(server)
        .get('/rooms')
        .query({ staler: scopedRoom.lastMessageAt })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            if ((new Date(room.lastMessageAt)).getTime() >= (new Date(scopedRoom.lastMessageAt)).getTime()) {
              throw Error('Expected room updated at to be older than provided staler date.');
            }
          });
          done();
        });
    });

    it('200s with an array of rooms updated before provider fresher date', done => {
      chai.request(server)
        .get('/rooms')
        .query({ fresher: testRoomOne.lastMessageAt })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            if ((new Date(room.lastMessageAt)).getTime() <= (new Date(testRoomOne.lastMessageAt)).getTime()) {
              throw Error('Expected room updated at to be newer than provided fresher date.');
            }
          });
          done();
        });
    });

    it('200s with room object when provided user ids that are a part of existing room that includes authenticated user', done => {
      chai.request(server)
        .get(`/rooms?privateUserIds=${encodeURIComponent(JSON.stringify(testPermissionsPrivateRoom.userIds))}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('eventsTopic');
          response.body.id.should.equal(testPermissionsPrivateRoom.id);
          done();
        });
    });

    it('200s with room object when provided phone numbers of user ids that are a part of existing room that includes authenticated user', done => {
      chai.request(server)
        .get(`/rooms?privatePhones=${encodeURIComponent(JSON.stringify([ testUserTwo.phone, testUserThree.phone ]))}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          done();
        });
    });

    it('200s with an array of relevant rooms for the authenticated user', done => {
      chai.request(server)
        .get('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.should.have.property('eventsTopic');
            room.impressionsCount.should.be.a('number');
            room.previewRoomMessage.should.be.an('object');
            room.previewRoomUsers.should.be.an('array');
            room.user.should.be.an('object');
          });
          done();
        });
    });

    it('200s with an array of room objects when provided search', done => {
      chai.request(server)
        .get('/rooms')
        .query({ search: 'test' })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.should.have.property('id');
            room.should.have.property('eventsTopic');
            room.should.have.property('accessLevel');
            room.should.have.property('title');
            room.should.have.property('impressionsCount');
            room.should.have.property('usersCount');
            room.should.have.property('lastMessageAt');
            room.should.have.property('updatedAt');
            room.should.have.property('createdAt');
            room.should.have.property('previewRoomMessage');
            room.should.have.property('previewRoomUsers');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/rooms');
    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/rooms/1');
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms', () => {
    it('200s with updated room object', done => {
      const fields = {
        accessLevel: 'private',
        title: 'Private message title test',
      };

      chai.request(server)
        .patch(`/rooms/${scopedRoom.id}`)
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

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/rooms/1');
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms', () => {
    it('204s and deletes room', done => {
      chai.request(server)
        .delete(`/rooms/${scopedRoom.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/rooms/1');
  });
});
