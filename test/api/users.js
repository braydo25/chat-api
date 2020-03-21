const fs = require('fs');
const helpers = require('../helpers');

describe('Users', () => {
  /*
   * POST
   */

  describe('POST /users', () => {

  });

  /*
   * PATCH
   */

  describe('PATCH /users/@me', () => {

    helpers.it401sWhenUserAuthorizationIsInvalid('patch', '/users');
  });
});
