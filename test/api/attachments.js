const fs = require('fs');
const helpers = require('../helpers');

describe('Attachments', () => {
  let scopedAttachment = null;

  /*
   * POST
   */

  describe('POST /attachments', () => {
    it('200s with created attachment object', done => {
      chai.request(server)
        .post('/attachments')
        .set('X-Access-Token', testUserOne.accessToken)
        .attach('file', fs.readFileSync('./test/happier.mp4'), 'happier.mp4')
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('bytes');
          response.body.should.have.property('url');
          response.body.should.have.property('mimetype');
          response.body.should.have.property('checksum');
          scopedAttachment = response.body;
          done();
        });
    });

    it('400s when not provided file', done => {
      chai.request(server)
        .post('/attachments')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('post', '/attachments');
  });

  /*
   * GET
   */

  describe('GET /attachments', () => {
    it('200s when provided checksum and filename of file previously uploaded by user', done => {
      chai.request(server)
        .get('/attachments')
        .query({ checksum: scopedAttachment.checksum, filename: scopedAttachment.filename })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.id.should.equal(scopedAttachment.id);
          done();
        });
    });

    it('204s when provided checksum or filename not previously uploaded by user', done => {
      chai.request(server)
        .get('/attachments')
        .query({ checksum: 'u12hdu1h2d7h2', filename: 'random.jpg' })
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('400s when not provided checksum or filename', done => {
      chai.request(server)
        .get('/attachments')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/attachments');
  });
});
