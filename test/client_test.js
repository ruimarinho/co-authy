
/**
 * Module dependencies.
 */

import * as mocks from './mocks';
import AuthyClient from '../src';
import AuthyError from '../src/errors/authy-error';
import AuthyHttpError from '../src/errors/authy-http-error';
import AuthyInvalidApiKeyError from '../src/errors/authy-invalid-api-key-error';
import AuthyInvalidRequestError from '../src/errors/authy-invalid-request-error';
import AuthyInvalidTokenError from '../src/errors/authy-invalid-token-error';
import AuthyInvalidTokenUsedRecentlyError from '../src/errors/authy-invalid-token-used-recently-error';
import AuthyUserNotFoundError from '../src/errors/authy-user-not-found-error';
import AuthyValidationFailedError from '../src/errors/authy-validation-failed-error';
import should from 'should';
import sinon from 'sinon';
import { Validator } from 'validator.js';

/**
 * Test `Client`.
 */

describe('Client', () => {
  const client = new AuthyClient({ key: process.env.AUTHY_KEY || 'fooqux' }, { host: 'http://sandbox-api.authy.com' });

  it('should throw an error if the api `key` is missing', () => {
    try {
      new AuthyClient();

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(AuthyValidationFailedError);
      e.errors.key.show().assert.should.equal('HaveProperty');
    }
  });

  it('should set defaults', function() {
    const testClient = new AuthyClient({ key: 'foo' });

    testClient.key.should.equal('foo');
    testClient.host.should.equal('https://api.authy.com');
  });

  it('should throw an error if api `key` is invalid', async () => {
    mocks.registerUser.failWithApiKeyInvalid();

    const testClient = new AuthyClient({ key: 'foo' }, { host: 'http://sandbox-api.authy.com' });

    try {
      await testClient.registerUser('foo@bar.com', '408-550-3542');

      should.fail();
    } catch(e) {
      e.should.be.instanceOf(AuthyInvalidApiKeyError);
      e.message.should.equal('Invalid API key.');
    }
  });

  describe('registerUser()', () => {
    ['authyId', 'email', 'phone', 'countryCode'].forEach(parameter => {
      it(`should throw an error if \`${parameter}\` is missing`, async () => {
        try {
          await client.registerUser();

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors[parameter].show().assert.should.equal('HaveProperty');
        }
      });
    });

    it('should throw an error if `email` is invalid', async () => {
      try {
        await client.registerUser({ email: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.email[0].show().assert.should.equal('Email');
      }
    });

    it('should throw an error if `phone` invalid', async () => {
      try {
        client.registerUser({ email: 'foo@bar.com', phone: 'FOO', countryCode: '351' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.phone[0].show().assert.should.equal('PhoneNumber');
      }
    });

    it('should throw an error if `countryCode` is not supported', async () => {
      try {
        client.registerUser({ email: 'foo@bar.com', phone: '123456789', countryCode: '12345' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.countryCode[0].show().assert.should.equal('CountryCallingCode');
      }
    });

    it('should throw an error if `email` is not sent', async () => {
      sinon.stub(Validator.prototype, 'validate', () => { return true; });

      mocks.registerUser.failWithRequestInvalid({ errors: { email: 'invalid-blank' } });

      try {
        await client.registerUser({ phone: '123456789', countryCode: '351' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidRequestError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', email: 'is invalid and can\'t be blank' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `email` is sent but is considered invalid', async () => {
      sinon.stub(Validator.prototype, 'validate', () => { return true; });

      mocks.registerUser.failWithRequestInvalid({ errors: { email: 'invalid' } });

      try {
        await client.registerUser({ email: 'foo', phone: '123456789', countryCode: '351' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidRequestError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', email: 'is invalid' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `cellphone` is not sent', async () => {
      sinon.stub(Validator.prototype, 'validate', () => { return true; });

      mocks.registerUser.failWithRequestInvalid({ errors: { cellphone: 'invalid' } });

      try {
        await client.registerUser({ email: 'foo@bar.com', countryCode: '351' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidRequestError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', cellphone: 'is invalid' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `cellphone` is sent but considered invalid', async () => {
      sinon.stub(Validator.prototype, 'validate', () => { return true; });

      mocks.registerUser.failWithRequestInvalid({ errors: { cellphone: 'invalid' } });

      try {
        await client.registerUser({ email: 'foo@bar.com', phone: 'FOO', countryCode: '351' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidRequestError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', cellphone: 'is invalid' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `countryCode` is sent but is considered unsupported', async () => {
      sinon.stub(Validator.prototype, 'validate', () => { return true; });

      mocks.registerUser.failWithRequestInvalid({ errors: { countryCode: 'unsupported' } });

      try {
        await client.registerUser({ email: 'foo@bar.com', phone: '123456789', countryCode: '12345' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidRequestError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', countryCode: 'is not supported' });
      }

      Validator.prototype.validate.restore();
    });
    // it('should throw an error if `user.id` is not returned', async () => {
    //   mocks.registerUser.succeedWithMissingUserId();

    //   try {
    //     await client.registerUser({ email: 'foo@bar.com', phone: '911234567', countryCode: '351' })

    //     should.fail();
    //   } catch (e) {
    //     e.should.be.instanceOf(AuthyError);
    //     e.message.should.equal('`user.id` is missing');
    //     e.body.should.not.be.empty;
    //   }
    // });

    it('should support `countryCode` in the ISO 3166-1 alpha-2 format', async () => {
      mocks.registerUser.succeed({
        matchBody: {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '911234567',
          'user[country_code]': '351'
        }
      });

      await client.registerUser({ email: 'foo@bar.com', phone: '911234567', countryCode: 'PT' });
    });

    it('should support `countryCode` in the special International Networks (+882)', async () => {
      mocks.registerUser.succeed();

      await client.registerUser({ email: 'foo@bar.com', phone: '13300655', countryCode: '882' });
    });

    it('should support `countryCode` in the special International Networks (+883)', async () => {
      mocks.registerUser.succeed();

      await client.registerUser({ email: 'foo@bar.com', phone: '510012345', countryCode: '883' });
    });

    it('should support `countryCode` assigned to multiple countries', async () => {
      mocks.registerUser.succeed();

      await client.registerUser({ email: 'foo@bar.com', phone: '408-550-3542', countryCode: '1' });
    });

    it.only('should default `countryCode` to USA (+1) if missing', async () => {
      mocks.registerUser.succeed({
        matchBody: {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '5627562233',
          'user[country_code]': '1'
        }
      });

      await client.registerUser({ email: 'foo@bar.com', phone: '562756--2233' });
    });

    it('should send `cellphone` in the e164 format', async () => {
      var numbers = [
        [['15515025000', 'MX'], ['15515025000', '52']],
        [['044 55 1502-5000', 'MX'], ['15515025000', '52']],
        [['915555555', 'PT'], ['915555555', '351']],
      ];

      for (var i = 0; i < numbers.length; i++) {
        mocks.registerUser.succeed({
          matchBody: {
            'user[email]': 'foo@bar.com',
            'user[cellphone]': numbers[i][1][0],
            'user[country_code]': numbers[i][1][1]
          }
        });

        await client.registerUser({ email: 'foo@bar.com', phone: numbers[i][0][0], countryCode: numbers[i][0][1] });
      }
    });

    it('should return the authy user `id`', async () => {
      mocks.registerUser.succeed();

      const response = await client.registerUser({ email: 'foo@bar.com', phone: '911234567', countryCode: '351' });

      response.user.id.should.equal(1635);
    });
  });

  describe('verifyToken()', () => {
    ['authyId', 'token'].forEach(parameter => {
      it(`should throw an error if \`${parameter}\` is missing`, async () => {
        try {
          await client.verifyToken();

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors[parameter].show().assert.should.equal('HaveProperty');
        }
      });
    });

    it('should throw an error if `authyId` is invalid', async () => {
      try {
        await client.verifyToken({ authyId: '/' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId[0].show().assert.should.equal('AuthyId');
      }
    });

    it('should throw an error if `token` is invalid', async () => {
      try {
        await client.verifyToken({ token: '../' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.token[0].show().assert.should.equal('TotpToken');
      }
    });

    it('should throw an error if `force` is invalid', async () => {
      try {
        await client.verifyToken({ authyId: 1635, token: 'foobar' }, { force: 'yes' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.force[0].show().assert.should.equal('Boolean');
      }
    });

    it('should throw an error if the `token` is invalid', async () => {
      sinon.stub(Validator.prototype, 'validate', () => { return true; });

      mocks.verifyToken.fail();

      try {
        await client.verifyToken({ authyId: 1635, token: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidTokenError);
        e.message.should.equal('Token is invalid.');
        e.body.should.not.be.empty;
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if the `token` has been used recently', async () => {
      mocks.verifyToken.failWithRecentlyUsed();

      try {
        await client.verifyToken({ authyId: 1635, token: '0601338' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidTokenUsedRecentlyError);
        e.message.should.equal('Token is invalid. Token was used recently.');
        e.body.should.not.be.empty;
      }
    });

    it('should verify the token', async () => {
      mocks.verifyToken.succeed();

      await client.verifyToken({ authyId: 1635, token: '1234567' });
    });

    it('should support forcing the verification of the token', async () => {
      mocks.verifyToken.succeedWithForce();

      await client.verifyToken({ authyId: 1635, token: '1234567' }, { force: true });
    });
  });

  describe('requestSms()', async () => {
    it('should throw an error if `authyId` is missing', async () => {
      try {
        await client.requestSms();

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authyId` is invalid', async () => {
      try {
        await client.requestSms({ authyId: '/' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId[0].show().assert.should.equal('AuthyId');
      }
    });

    it('should throw an error if `force` is invalid', async () => {
      try {
        await client.requestSms({ authyId: 1635 }, { force: 'yes' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.force[0].show().assert.should.equal('Boolean');
      }
    });

    it('should throw an error if `shortcode` is invalid', async () => {
      try {
        await client.requestSms({ authyId: 1635 }, { shortcode: 'yes' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.shortcode[0].show().assert.should.equal('Boolean');
      }
    });

    // describe('remote validation', () => {
    //   it('should throw an error if the `authyId` is invalid', () => {
    //     sinon.stub(Validator.prototype, 'validate', () => { return true; });

    //     mocks.requestSms.failWithAuthyIdNotFound();

    //     return client.requestSms(1600)
    //       .then(should.fail)
    //       .catch((e) => {
    //         e.should.be.instanceOf(AuthyHttpError);
    //         e.message.should.equal('User not found.');
    //         e.body.should.not.be.empty;

    //         Validator.prototype.validate.restore();
    //       });
    //   });
    // });

    // it('should throw an error if a `cellphone` is not returned', () => {
    //   mocks.requestSms.succeedWithCellphoneMissing();

    //   return client.requestSms(1635)
    //     .then(should.fail)
    //     .catch((e) => {
    //       e.should.be.instanceOf(AuthyError);
    //       e.message.should.equal('`cellphone` is missing');
    //       e.body.should.not.be.empty;
    //     });
    // });

    it('should request an SMS to be sent to the cellphone', async () => {
      mocks.requestSms.succeed();

      await client.requestSms({ authyId: 1635 });
    });

    it('should request an SMS to be sent to the cellphone even if the request is ignored', async () => {
      mocks.requestSms.succeedWithSmsIgnored();

      await client.requestSms({ authyId: 1635 });
    });

    it('should support forcing a request to send an SMS to the cellphone', async () => {
      mocks.requestSms.succeedWithForce();

      await client.requestSms({ authyId: 1635 }, { force: true });
    });

    it('should support a request to send an SMS to the cellphone using shortcodes', async () => {
      mocks.requestSms.succeedWithShortcode();

      await client.requestSms({ authyId: 1635 }, { shortcode: true });
    });
  });

  describe('requestCall()', async () => {
    it('should throw an error if `authyId` is missing', async () => {
      try {
        await client.requestCall();

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authyId` is invalid', async () => {
      try {
        await client.requestCall({ authyId: '/' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId[0].show().assert.should.equal('AuthyId');
      }
    });

    it('should throw an error if `force` is invalid', async () => {
      try {
        await client.requestCall({ authyId: 1635 }, { force: 'yes' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.force[0].show().assert.should.equal('Boolean');
      }
    });

    // describe('remote validation', async () => {
    //   it('should throw an error if the `authyId` is invalid', () => {
    //     sinon.stub(Validator.prototype, 'validate', async () => { return true; });

    //     mocks.requestCall.failWithAuthyIdNotFound();

    //     return client.requestCall(1600)
    //       .then(should.fail)
    //       .catch(function(e) {
    //         e.should.be.instanceOf(AuthyUserNotFoundError);
    //         e.message.should.equal('User not found.');
    //         e.body.should.not.be.empty;

    //         Validator.prototype.validate.restore();
    //       });
    //   });
    // });

    // it('should throw an error if a `cellphone` is not returned', () => {
    //   mocks.requestCall.succeedWithCellphoneMissing();

    //   return client.requestCall(1635)
    //     .then(should.fail)
    //     .catch(function(e) {
    //       e.should.be.instanceOf(AuthyError);
    //       e.message.should.equal('`cellphone` is missing');
    //       e.body.should.not.be.empty;
    //     });
    // });

    it('should request a call to the cellphone', async () => {
      mocks.requestCall.succeed();

      await client.requestCall({ authyId: 1635 });
    });

    it('should request a call to the cellphone even if the request is ignored', async () => {
      mocks.requestCall.succeedWithCallIgnored();

      await client.requestCall({ authyId: 1635 });
    });

    it('should support forcing a request to call the cellphone', async () => {
      mocks.requestCall.succeedWithForce();

      await client.requestCall({ authyId: 1635 }, { force: true });
    });
  });

  describe('deleteUser()', () => {
    it('should throw an error if `authyId` is missing', async () => {
      try {
        await client.deleteUser();

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authyId` is invalid', async () => {
      try {
        await client.deleteUser({ authyId: '/' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId[0].show().assert.should.equal('AuthyId');
      }
    });

    it('should delete the user', async () => {
      mocks.deleteUser.succeed();

      await client.deleteUser({ authyId: 1635 });
    });
  });

  describe('getUserStatus()', async () => {
    it('should throw an error if `authyId` is missing', async () => {
      try {
        await client.getUserStatus();

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authyId` is invalid', async () => {
      try {
        await client.getUserStatus({ authyId: '/' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId[0].show().assert.should.equal('AuthyId');
      }
    });

    it('should return the user status', async () => {
      mocks.userStatus.succeed();

      const status = await client.getUserStatus({ authyId: 1635 });

      status.should.have.keys('message', 'status', 'success');
    });
  });

  describe('registerActivity()', () => {
    ['authyId', 'type', 'ip'].forEach(parameter => {
      it(`should throw an error if \`${parameter}\` is missing`, async () => {
        try {
          await client.registerActivity();

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors[parameter].show().assert.should.equal('HaveProperty');
        }
      });
    });

    it('should throw an error if `authyId` is invalid', async () => {
      try {
        await client.registerActivity({ authyId: '/' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.authyId[0].show().assert.should.equal('AuthyId');
      }
    });

    it('should throw an error if `ip` is invalid', async () => {
      try {
        await client.registerActivity({ ip: 'x.y.z.t' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.ip[0].show().assert.should.equal('Ip');
      }
    });

    it('should throw an error if `type` is invalid', async () => {
      try {
        await client.registerActivity({ type: 'kicked' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.type[0].show().assert.should.equal('Activity');
      }
    });

    it('should register the activity', async () => {
      mocks.registerActivity.succeed({
        matchBody: {
          'data[reason]': 'foo',
          'ip': '86.112.56.34',
          'type': 'banned'
        }
      });

      await client.registerActivity({ authyId: 1635, data: { reason: 'foo' }, ip: '86.112.56.34', type: 'banned' });
    });
  });

  describe('getApplicationDetails()', () => {
    it('should return the application details', async () => {
      mocks.applicationDetails.succeed();

      const details = await client.getApplicationDetails();

      details.should.have.keys('app', 'message', 'success');
    });
  });

  describe('getApplicationStatistics()', () => {
    it('should return the application statistics', async () => {
      mocks.applicationStatistics.succeed();

      const statistics = await client.getApplicationStatistics();

      statistics.should.have.keys('app_id', 'count', 'message', 'total_users', 'stats', 'success');
      statistics.stats.should.matchEach(value => value.should.have.keys('api_calls_count', 'auths_count', 'calls_count', 'month', 'sms_count', 'users_count', 'year'));
    });
  });
});
