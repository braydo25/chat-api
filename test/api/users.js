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
          response.should.have.status(204);
          done();
          helpers.logExampleResponse(response);
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
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.id.should.be.a('number');
          done();
          helpers.logExampleResponse(response);
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
          response.should.have.status(400);
          done();
          helpers.logExampleResponse(response);
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
          response.should.have.status(400);
          done();
          helpers.logExampleResponse(response);
        });
    });
  });

  /*
   * PATCH
   */

  describe('PATCH /users/@me', () => {
    it('200s with updated user object', done => {
      const fields = {
        firstName: 'Braydon',
        lastName: 'Batungbacal',
      };

      chai.request(server)
        .patch('/users')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.firstName.should.equal(fields.firstName);
          response.body.lastName.should.equal(fields.lastName);
          done();
          helpers.logExampleResponse(response);
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/users');
  });
});
