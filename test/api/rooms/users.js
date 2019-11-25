const helpers = require('../../helpers');

describe('Room Users', () => {
  /*
   * GET
   */

  describe('GET /rooms/{room.id}/users', () => {
    it('200s with an array of room users', done => {
      chai.request(server)
        .get(`/rooms/${testRoomOne.id}/users`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(roomUser => {
            roomUser.should.have.property('id');
            roomUser.should.have.property('permissions');
            roomUser.should.have.property('user');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', `/rooms/${testRoomOne.id}/users`);
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms/{room.id}/users/{user.id}', () => {
    it('200s with updated room user object', done => {
      const fields = {
        permissions: [ 'ADMIN' ],
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/users/${testUserThree.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.permissions.should.deep.equal(fields.permissions);
          done();
        });
    });

    it('400s when updating user that is not a member of room', done => {
      const fields = {
        banned: true,
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/users/${testUserTwo.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    it('401s when updating user does not have permission', done => {
      const fields = {
        banned: true,
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}/users/${testUserOne.id}`)
        .set('X-Access-Token', testUserThree.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/rooms/${testRoomOne.id}/users/${testUserOne.id}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/{room.id}/users/{user.id}', () => {
    it('204s and deletes room user', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/users/${testUserThree.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(204);
          done();
        });
    });

    it('400s when deleting user who is not a member of room', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/users/${testUserThree.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    it('401s when updating user does not have permission', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}/users/${testUserOne.id}`)
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/rooms/${testRoomOne.id}/users/${testUserOne.id}`);
  });
});
