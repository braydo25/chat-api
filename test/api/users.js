const fs = require('fs');
const helpers = require('../helpers');

describe('Users', () => {
  /*
   * POST
   */

  describe('POST /users', () => {
    it('200s with created user object when provided username and password', done => {
      const fields = {
        username: 'chillen123',
        password: 'test1234',
      };

      chai.request(server)
        .post('/users')
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.username.should.equal(fields.username);
          done();
        });
    });

    it('200s when provided existing username and correct password', done => {
      done();
    });

    it('401s when provided existing username and incorrect password', done => {
      const fields = {
        username: 'chillen123',
        password: 'badpassword',
      };

      chai.request(server)
        .post('/users')
        .send(fields)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  /*
   * PATCH
   */

  describe('PATCH /users/@me', () => {
    it('200s with updated user object', done => {
      const fields = {
        password: 'yolo123',
        name: 'The Wizard',
      };

      chai.request(server)
        .patch('/users/@me')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          done();
        });
    });

    it('200s with updated user object when provided icon', done => {
      const fields = {
        name: 'New Name Who Dis',
      };

      chai.request(server)
        .patch('/users/@me')
        .set('X-Access-Token', testUserOne.accessToken)
        .field('name', fields.name)
        .attach('photo', fs.readFileSync('./test/iconPhoto.jpg'), 'icon.jpg')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.name.should.equal(fields.name);
          response.body.iconHash.should.be.a('string');
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/users');
  });
});
