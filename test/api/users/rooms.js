const helpers = require('../../helpers');

describe('User Rooms', () => {
  /*
   * GET
   */

  describe('GET /users/:userId/rooms', () => {
    it('200s with an array of public and protected room and room repost objects for provided userId', done => {
      chai.request(server)
        .get(`/users/${testUserThree.id}/rooms`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.accessLevel.should.not.equal('private');
            room.should.have.property('eventsTopic');
            room.user.should.be.an('object');
            if (room.roomRepostId) {
              room.roomRepostUser.id.should.equal(testUserThree.id);
            } else {
              room.user.id.should.equal(testUserThree.id);
            }
          });
          done();
        });
    });

    it('200s with an array of converasations before provided room createdAt datetime', done => {
      chai.request(server)
        .get(`/users/${testUserOne.id}/rooms`)
        .query({ before: testPermissionsPublicRoom.createdAt })
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            if ((new Date(room.createdAt)).getTime() >= (new Date(testPermissionsPublicRoom.createdAt)).getTime()) {
              throw Error('Expected room updated at to be older than provided before date.');
            }
          });
          done();
        });
    });

    it('200s with an array of converasations after provided room createdAt datetime', done => {
      chai.request(server)
        .get(`/users/${testUserOne.id}/rooms`)
        .query({ after: testRoomOne.createdAt })
        .set('X-Access-Token', testUserThree.accessToken)
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

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/users/1/rooms');
  });

  /*
   * DELETE
   */

  describe('DELETE /users/me/rooms/:roomId', () => {
    it('204s and deletes room user', done => {
      chai.request(server)
        .delete(`/users/me/rooms/${testRoomTwo.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', '/users/me/rooms/1');
  });
});
