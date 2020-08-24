const helpers = require('../helpers');

describe('Users', () => {
  /*
   * POST
   */

  describe('POST /users', () => {
    it('204s when provided phone number ands sends phone login code via text message', done => {
      const fields = {
        phone: '12535487443',
      };

      chai.request(server)
        .post('/users')
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('200s with user object when provided phone number and login code', done => {
      const fields = {
        phone: '12535487443',
        phoneLoginCode: '000000',
      };

      chai.request(server)
        .post('/users')
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.be.a('number');
          mqttConnection.subscribe(response.body.eventsTopic);
          done();
        });
    });

    it('400s when phone login code is invalid', done => {
      const fields = {
        phone: '12535487443',
        phoneLoginCode: '123456',
      };

      chai.request(server)
        .post('/users')
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    it('400s when invalid phone number is provided', done => {
      const fields = {
        phone: '01010101',
      };

      chai.request(server)
        .post('/users')
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });
  });

  /*
   * GET
   */

  describe('GET /users', () => {
    it('200s with user object when provided userId', done => {
      chai.request(server)
        .get(`/users/${testUserTwo.id}`)
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.equal(testUserTwo.id);
          response.body.should.have.property('username');
          response.body.should.have.property('name');
          response.body.should.have.property('about');
          response.body.should.have.property('avatarAttachment');
          response.body.should.have.property('followersCount');
          done();
        });
    });

    it('200s with an array of user objects when provided search', done => {
      chai.request(server)
        .get('/users')
        .query({ search: 'BrAy' })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(user => {
            user.should.be.an('object');
            user.should.not.have.property('accessToken');
            user.should.not.have.property('eventsTopic');
            user.should.not.have.property('phone');
          });
          done();
        });
    });

    it('200s with an array of user objects before provided user id and matching search', done => {
      chai.request(server)
        .get('/users')
        .query({ search: 'a', before: 3 })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(user => {
            user.id.should.be.lessThan(3);
          });
          done();
        });
    });

    it('200s with an array of user objects after provided user id and matching search', done => {
      chai.request(server)
        .get('/users')
        .query({ search: 'a', after: 3 })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(user => {
            user.id.should.be.greaterThan(3);
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/users/2');
  });

  /*
   * PATCH
   */

  describe('PATCH /users/@me', () => {
    it('200s with updated user object', done => {
      const fields = {
        avatarAttachmentId: testAttachmentOne.id,
        username: 'braydonio',
        name: 'Braydon Batungbacal',
        about: 'My name is braydon!',
      };

      chai.request(server)
        .patch('/users')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          response.body.about.should.equal(fields.about);
          done();
        });
    });

    it('400s when provided a username that is already taken', done => {
      const fields = {
        username: 'braydonio',
      };

      chai.request(server)
        .patch('/users')
        .set('X-Access-Token', testUserTwo.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/users');
  });
});
