const helpers = require('../helpers');

describe('Embeds', () => {
  /*
   * PUT
   */

  describe('PUT /embeds', () => {
    let scopedEmbed = null;

    it('200s with created embed object', done => {
      const fields = {
        url: 'https://www.youtube.com/watch?v=hdAQefnZsLk',
      };

      chai.request(server)
        .put('/embeds')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.userId.should.equal(testUserOne.id);
          response.body.url.should.equal(fields.url);
          scopedEmbed = response.body;
          done();
        });
    });

    it('200s with an already existing embed object for system cached url', done => {
      const fields = {
        url: 'https://www.youtube.com/watch?v=hdAQefnZsLk',
      };

      chai.request(server)
        .put('/embeds')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.id.should.equal(scopedEmbed.id);
          done();
        });
    });

    it('200s with embed object with width and height when provided image url', done => {
      const fields = {
        url: 'https://buffer.com/library/content/images/library/wp-content/uploads/2016/06/giphy.gif',
      };

      chai.request(server)
        .put('/embeds')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.width.should.be.a('number');
          response.body.height.should.be.a('number');
          done();
        });
    });

    it('400s when not provided url', done => {
      chai.request(server)
        .put('/embeds')
        .set('X-Access-Token', testUserOne.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/embeds');
  });
});
