const helpers = require('../helpers');

describe('Conversations', () => {
  /*
   * POST
   */

  describe('POST /conversations', () => {
    it('200s with created conversation object', done => {
      const fields = {
        permission: 'public',
        conversationMessage: {
          text: 'test test test!',
        },
      };

      chai.request(server)
        .post('/conversations')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          console.log(response.body);
        });

      setTimeout(() => done(), 1000);
    });
  });
});
