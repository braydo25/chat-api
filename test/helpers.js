/*
 * Helpers
 */

module.exports.it401sWhenUserAuthorizationIsInvalid = (method, route) => {
  it('401s when user authorization is invalid', done => {
    chai.request(server)[method](route)
      .set('X-Access-Token', 'some bad token')
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
};

module.exports.jenkinsDelay = delayOverride => {
  /*
   * Jenkins can get tripped up from executing requests faster
   * than our DB master can write to read slaves. We use a
   * delay for now to prevent any issues.
   */

  return new Promise(resolve => setTimeout(resolve, delayOverride || 1000));
};
