const fs = require('fs');
const helpers = require('../helpers');

describe('Rooms', () => {
  let createdRoom = null;

  /*
   * POST
   */

  describe('POST /rooms', () => {
    it('200s with created room object when provided name', done => {
      const fields = {
        name: 'Bouldering',
        description: 'climbing and stuff',
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          createdRoom = response.body;
          done();
        });
    });

    it('400s when provided case insensitive room name that already exists', done => {
      const fields = {
        name: 'bouldering',
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

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/rooms');
  });

  /*
   * GET
   */

  describe('GET /rooms', () => {
    it('200s with an array of recommended rooms', done => {
      chai.request(server)
        .get('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.should.have.property('name');
            room.should.have.property('description');
            room.should.have.property('iconHash');
          });
          done();
        });
    });

    it('200s with an array of matching rooms when providing case insensitive search query parameter', done => {
      const queryParams = {
        search: 'bouldeR',
      };

      chai.request(server)
        .get('/rooms')
        .query(queryParams)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.should.have.property('name');
            room.should.have.property('description');
            room.should.have.property('iconHash');
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/rooms');
  });

  /*
   * PATCH
   */

  describe('PATCH /rooms/{room.id}', () => {
    it('200s with updated room object', done => {
      const fields = {
        name: 'Boulding WA',
        description: 'We boulder in WA',
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          response.body.description.should.equal(fields.description);
          done();
        });
    });

    it('200s with updated room object when provided icon', done => {
      const fields = {
        description: 'testing',
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .field('description', fields.description)
        .attach('icon', fs.readFileSync('./test/iconPhoto.jpg'), 'icon.jpg')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.description.should.equal(fields.description);
          response.body.iconHash.should.be.a('string');
          done();
        });
    });

    it('401s when updating user does not have permission', done => {
      const fields = {
        name: 'testing',
      };

      chai.request(server)
        .patch(`/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/rooms/${testRoomOne.id}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/{room.id}', () => {
    it('204s and deletes room when provided room hash id owned by authorized user', done => {
      chai.request(server)
        .delete(`/rooms/${createdRoom.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          response.should.have.status(204);
          done();
        });
    });

    it('401s when authorized user does not have permission', done => {
      chai.request(server)
        .delete(`/rooms/${testRoomOne.id}`)
        .set('X-Access-Token', testUserTwo.accessToken)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/rooms/${testRoomOne.id}`);
  });
});
