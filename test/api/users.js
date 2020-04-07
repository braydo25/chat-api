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
   * PATCH
   */

  describe('PATCH /users/@me', () => {
    it('200s with updated user object', done => {
      const fields = {
        avatarAttachmentId: testAttachmentOne.id,
        username: 'braydonio',
        name: 'Braydon Batungbacal',
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
