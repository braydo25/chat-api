const helpers = require('../../helpers');

describe('Room Users', () => {
  let scopedRoomUser = null;

  /*
   * PUT
   */

  describe('PUT /rooms/:roomId/users', () => {
    it('200s with created room user object when provided user id', done => {
      const fields = {
        userId: testUserTwo.id,
      };

      chai.request(server)
        .put(`/rooms/${testRoomThree.id}/users`)
        .set('X-Access-Token', testUserThree.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.roomId.should.equal(testRoomThree.id);
          response.body.userId.should.equal(fields.userId);
          response.body.permissions.length.should.be.at.least(1);
          scopedRoomUser = response.body;
          done();
        });
    });

    it('200s with created room user object when provided phone user', done => {
      const fields = {
        phoneUser: {
          phone: '12334456565',
          name: 'Cool Test Guy',
        },
      };

      chai.request(server)
        .put(`/rooms/${testRoomThree.id}/users`)
        .set('X-Access-Token', testUserThree.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.body.should.be.an('object');
          response.body.should.be.an('object');
          response.body.roomId.should.equal(testRoomThree.id);
          response.body.permissions.length.should.be.at.least(1);
          done();
        });
    });

    it('200s with existing room user object', done => {
      const fields = {
        userId: scopedRoomUser.userId,
      };

      chai.request(server)
        .put(`/rooms/${testRoomThree.id}/users`)
        .set('X-Access-Token', testUserThree.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(scopedRoomUser.id);
          response.body.permissions.length.should.be.at.least(1);
          done();
        });
    });

    it('400s when not provided a user id', done => {
      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('400s when provided an invalid user id', done => {
      const fields = {
        userId: 51251,
      };

      chai.request(server)
        .put(`/rooms/${testRoomOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('400s when adding user to private room with 2 or less users', done => {
      const fields = {
        userId: testUserFour.id,
      };

      chai.request(server)
        .put(`/rooms/${testRoomTwo.id}/users`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('403s when requesting user does not have ROOM_USERS_CREATE permission for room with private access level', done => {
      chai.request(server)
        .put(`/rooms/${testPermissionsPrivateRoom.id}/users`)
        .set('X-Access-Token', testPermissionsPrivateRoomPermissionlessUser.accessToken)
        .send({ userId: testUserFour.id })
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/rooms/1/users');
  });

  /*
   * GET
   */

  describe('GET /rooms/:roomId/users', () => {
    it('200s with an array of room user objects', done => {
      chai.request(server)
        .get(`/rooms/${testRoomOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(roomUser => {
            roomUser.should.have.property('user');
            roomUser.user.should.have.property('id');
            roomUser.user.should.have.property('name');
            roomUser.user.should.have.property('username');
            roomUser.user.should.have.property('avatarAttachment');
          });
          done();
        });
    });

    it('403s when requesting user does not have ROOM_USERS_READ permission for room with private access level', done => {
      chai.request(server)
        .get(`/rooms/${testPermissionsPrivateRoom.id}/users`)
        .set('X-Access-Token', testPermissionsPrivateRoomPermissionlessUser.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/rooms/1/users');
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms/:roomId/users', () => {
    it('200s with updated room user object when provided permissions', done => {
      const fields = {
        permissions: [
          'ROOM_MESSAGES_CREATE',
          'ROOM_MESSAGES_READ',
        ],
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/users/${testRoomOneUserOne.id}`)
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

    it('403s when requesting user does not have ROOM_USERS_UPDATE permission for room with any access level', done => {
      const fields = {
        permissions: [
          'ROOM_MESSAGES_READ',
        ],
      };

      chai.request(server)
        .patch(`/rooms/${testPermissionsPrivateRoom.id}/users/${testPermissionsPrivateRoomPermissionlessRoomUser.id}`)
        .set('X-Access-Token', testPermissionsPrivateRoomPermissionlessUser.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/rooms/1/users/1');
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/:roomId/users', () => {
    it('204s and deletes room user', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomThree.id}/users/${scopedRoomUser.id}`)
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('403s when requesting user does not have ROOM_USERS_DELETE permission for room with any access level', done => {
      chai.request(server)
        .delete(`/rooms/${testPermissionsPublicRoom.id}/users/${testPermissionsPublicRoomGeneralRoomUser.id}`)
        .set('X-Access-Token', testPermissionsPublicRoomPermissionlessUser.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(403);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/rooms/1/users');
  });
});
