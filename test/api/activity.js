const helpers = require('../helpers');

describe('Activity', () => {
  /*
   * GET
   */

  describe('GET /activity', () => {
    it('200s with an array of activity objects', done => {
      chai.request(server)
        .get('/activity')
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(activity => {
            if (activity.roomRepost) {
              activity.roomRepost.room.should.be.an('object');
              activity.roomRepost.room.should.have.property('id');
              activity.roomRepost.room.should.have.property('title');
              activity.roomRepost.should.have.property('user');
            }

            if (activity.userFollower) {
              activity.userFollower.should.have.property('followerUser');
              activity.userFollower.followerUser.should.be.an('object');
            }
          });
          done();
        });
    });

    it('200s with an array of activity objects and updates the lastViewedActivityAt property of the user', done => {
      chai.request(server)
        .get('/activity')
        .query({ viewed: true })
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          done();
        });
    });

    it('200s with an array of activity objects before provided user activity id', done => {
      chai.request(server)
        .get('/activity')
        .query({ before: 4 })
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.id.should.be.lessThan(4);
          });
          done();
        });
    });

    it('200s with an array of activity objects after provided user activity id', done => {
      chai.request(server)
        .get('/activity')
        .query({ after: 1 })
        .set('X-Access-Token', testUserThree.accessToken)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.at.least(1);
          response.body.forEach(room => {
            room.id.should.be.greaterThan(1);
          });
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('get', '/activity');
  });
});
