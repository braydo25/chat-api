const helpers = require('../helpers');

describe('Rooms', () => {
  /*
   * POST
   */

  describe('POST /rooms', () => {
    it('200s with created room object when provided name', done => {
      const fields = {
        name: 'Bouldering',
      };

      chai.request(server)
        .post('/rooms')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          done();
        });
    });

    it('400s when provided room name that already exists', done => {
      done('todo');
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
            room.should.have.property('hashId');
            room.should.have.property('name');
            room.should.have.property('description');
            room.should.have.property('iconHash');
          });
          done();
        });
    });

    it('200s with an array of matching rooms when providing search query parameter', done => {
      const queryParams = {
        search: 'bouldering',
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
            room.should.have.property('hashId');
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

  describe('PATCH /rooms/{room.hashId}', () => {
    it('200s with updated room object', done => {
      done('todo');
    });

    it('401s when updating user does not have permission', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('patch', `/rooms/${testRoomOne.hashId}`);
  });

  /*
   * DELETE
   */

  describe('DELETE /rooms/{room.hashId}', () => {
    it('204s and deletes room when provided room hash id owned by authorized user', done => {
      done('todo');
    });

    it('401s when deleting user does not have permission', done => {
      done('todo');
    });

//    helpers.it401sWhenUserAuthorizationIsInvalid('delete', `/rooms/${testRoomOne.hashId}`);
  });
});
