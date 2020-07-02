const helpers = require('../helpers');

const androidDetails = {
  platform: 'android',
  brand: 'Google',
  deviceCountry: 'US',
  deviceName: 'Braydons phablet',
  deviceLocale: 'en_US',
  manufacturer: 'Google',
  model: 'Nexus 5X',
  systemName: 'Android OS',
  systemVersion: '5.1',
  uniqueId: 'FCDBAWDF-6DDFC-4EAWDCB-BAWD2F5-92AWdC9E79AC7F9',
  userAgent: 'Mozilla/5.0 (Linux; U; Android 4.0.2; ko-kr; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
};

const iosDetails = {
  platform: 'ios',
  brand: 'Apple',
  deviceCountry: 'US',
  deviceName: 'Braydons iPhone',
  deviceLocale: 'en_US',
  manufacturer: 'Apple',
  model: 'iPhone 6',
  systemName: 'iPhone OS',
  systemVersion: '9.0',
  uniqueId: 'FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9',
  userAgent: 'AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.98 Mobile Safari/537.36',
};

describe('Devices', () => {
  /*
   * PUT
   */

  describe('PUT /devices', () => {
    it('204s when provided details and fcmRegistrationId', done => {
      const fields = {
        fcmRegistrationId: 'bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1',
        details: androidDetails,
      };

      chai.request(server)
        .put('/devices')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('204s when provided details and existing fcmRegistrationId', done => {
      const fields = {
        fcmRegistrationId: 'bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1',
        details: androidDetails,
      };

      chai.request(server)
        .put('/devices')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('204s when provided details and apnsToken', done => {
      const fields = {
        apnsToken: '2a31d914734970edf68b5da67403f09c8007996d775f1880480f2dc5f1d5c883',
        details: iosDetails,
      };

      chai.request(server)
        .put('/devices')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('204s when provided details and existing apnsToken', done => {
      const fields = {
        apnsToken: '2a31d914734970edf68b5da67403f09c8007996d775f1880480f2dc5f1d5c883',
        details: iosDetails,
      };

      chai.request(server)
        .put('/devices')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(204);
          done();
        });
    });

    it('400s when not provided apnsToken or fcmRegistrationId', done => {
      const fields = {
        details: androidDetails,
      };

      chai.request(server)
        .put('/devices')
        .set('X-Access-Token', testUserOne.accessToken)
        .send(fields)
        .end((error, response) => {
          helpers.logExampleResponse(response);
          response.should.have.status(400);
          done();
        });
    });

    helpers.it401sWhenUserAuthorizationIsInvalid('put', '/devices');
  });
});
