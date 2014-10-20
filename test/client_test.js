/* jshint camelcase:false*/

/**
 * Test dependencies.
 */

var AuthyClient = require('..');
var AuthyError = require('../errors/authy-error');
var AuthyHttpError = require('../errors/authy-http-error');
var AuthyInvalidApiKeyError = require('../errors/authy-invalid-api-key-error');
var AuthyInvalidRequestError = require('../errors/authy-invalid-request-error');
var AuthyInvalidTokenError = require('../errors/authy-invalid-token-error');
var AuthyInvalidTokenUsedRecentlyError = require('../errors/authy-invalid-token-used-recently-error');
var AuthyValidationFailedError = require('../errors/authy-validation-failed-error');
var Validator = require('validator.js').Validator;
var mocks = require('./mocks');
var should = require('should');
var sinon = require('sinon');

describe('Client', function() {
  var client;

  beforeEach(function(){
    /* jshint newcap:false*/
    client = AuthyClient(process.env.AUTHY_KEY || 'fooqux', { host: 'http://sandbox-api.authy.com' });
  });

  it('should throw an error if `apiKey` is missing', function() {
    try {
      new AuthyClient(undefined, { host: 'http://sandbox-api.authy.com' });
    } catch (e) {
      e.should.be.instanceOf(AuthyValidationFailedError);
      e.errors.api_key.show().assert.should.equal('HaveProperty');
    }
  });

  it('should not require the `new` keyword', function() {
    client.should.be.instanceOf(AuthyClient);
  });

  it('should set default options', function() {
    var c = new AuthyClient('foo');
    c.apiKey.should.equal('foo');
    c.apiUrl.should.equal('https://api.authy.com');
  });

  describe('#registerUser', function() {
    it('should throw an error if the api `key` is invalid', function *() {
      mocks.registerUser.failWithInvalidApiKey();

      var c = new AuthyClient('foo', { host: 'http://sandbox-api.authy.com' });

      try {
        yield c.registerUser('foo@bar.com', '408-550-3542');
      } catch (e) {
        e.should.be.instanceOf(AuthyInvalidApiKeyError);
        e.message.should.equal('Invalid API key.');
      }
    });

    it('should support `country_code` in the ISO 3166-1 alpha-2 format', function *() {
      mocks.registerUser.succeed({
        matchBody: {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '911234567',
          'user[country_code]': '351'
        }
      });

      yield client.registerUser('foo@bar.com', '911234567', 'PT');
    });

    it('should support the special International Networks `country_code` (+882)', function *() {
      mocks.registerUser.succeed();

      yield client.registerUser('foo@bar.com', '13300655', '882');
    });

    it('should support the special International Networks `country_code` (+883)', function *() {
      mocks.registerUser.succeed();

      yield client.registerUser('foo@bar.com', '510012345', '883');
    });

    it('should default the `country_code` to USA (+1) if it is missing', function *() {
      mocks.registerUser.succeed({
        matchBody: {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '5627562233',
          'user[country_code]': '1'
        }
      });

      yield client.registerUser('foo@bar.com', '562 756--2233');
    });

    it('should throw an error if the authy user `id` is not returned', function *() {
      mocks.registerUser.succeedWithMissingUserId();

      try {
        yield client.registerUser('foo@bar.com', '911234567', '351');
      } catch (e) {
        e.should.be.instanceOf(AuthyError);
        e.message.should.equal('`user.id` is missing');
        e.body.should.not.be.empty;
      }
    });

    it('should accept a `country_code` assigned to multiple countries', function *() {
      mocks.registerUser.succeed();

      (yield client.registerUser('foo@bar.com', '408-550-3542', '1')).user.id.should.equal(1635);
    });

    it('should send a properly formatted e164 version', function *() {
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

        yield client.registerUser('foo@bar.com', numbers[i][0][0], numbers[i][0][1]);
      }
    });

    it('should return the authy user `id`', function *() {
      mocks.registerUser.succeed();

      (yield client.registerUser('foo@bar.com', '911234567', '351')).user.id.should.equal(1635);
    });

    describe('client validation', function() {
      it('should throw an error if `email` is missing', function *() {
        try {
          yield client.registerUser(undefined, '123456789');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.email.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `email` is invalid', function *() {
        try {
          yield client.registerUser('foo', '123456789');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.email.should.have.length(1);
          e.errors.email[0].show().assert.should.equal('Email');
        }
      });

      it('should throw an error if `cellphone` is missing', function *() {
        try {
          yield client.registerUser('foo@bar.com');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.cellphone.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `cellphone` invalid', function *() {
        try {
          yield client.registerUser('foo@bar.com', 'FOO', '351');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.cellphone.should.have.length(1);
          e.errors.cellphone[0].show().assert.should.equal('PhoneNumber');
        }
      });

      it('should throw an error if `cellphone` is invalid', function *() {
        try {
          yield client.registerUser('foo@bar.com', '');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.cellphone[0].show().assert.should.equal('Required');
        }
      });

      it('should throw an error if `country_code` is not supported', function *() {
        try {
          yield client.registerUser('foo@bar.com', '123456789', '12345');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.country_code.should.have.length(1);
          e.errors.country_code[0].show().assert.should.equal('CountryCallingCode');
        }
      });
    });

    describe('remote validation', function() {
      it('should throw an error if `email` is missing', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.registerUser.failWithInvalidRequest({ email: 'invalid-blank' });

        try {
          yield client.registerUser('', '123456789', '351');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidRequestError);
          e.message.should.equal('User was not valid.');
          e.errors.should.eql({ message: 'User was not valid.', email: 'is invalid and can\'t be blank' });
        }

        Validator.prototype.validate.restore();
      });

      it('should throw an error if `email` is invalid', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.registerUser.failWithInvalidRequest({ email: 'invalid' });

        try {
          yield client.registerUser('foo', '123456789', '351');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidRequestError);
          e.message.should.equal('User was not valid.');
          e.errors.should.eql({ message: 'User was not valid.', email: 'is invalid' });
        }

        Validator.prototype.validate.restore();
      });

      it('should throw an error if `cellphone` is missing', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.registerUser.failWithInvalidRequest({ cellphone: 'invalid' });

        try {
          yield client.registerUser('foo@bar.com', '', '351');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidRequestError);
          e.message.should.equal('User was not valid.');
          e.errors.should.eql({ message: 'User was not valid.', cellphone: 'is invalid' });
        }

        Validator.prototype.validate.restore();
      });

      it('should throw an error if `cellphone` is invalid', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.registerUser.failWithInvalidRequest({ cellphone: 'invalid' });

        try {
          yield client.registerUser('foo@bar.com', 'FOO', '351');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidRequestError);
          e.message.should.equal('User was not valid.');
          e.errors.should.eql({ message: 'User was not valid.', cellphone: 'is invalid' });
        }

        Validator.prototype.validate.restore();
      });

      it('should throw an error if `country_code` is not supported', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.registerUser.failWithInvalidRequest({ country_code: 'unsupported' });

        try {
          yield client.registerUser('foo@bar.com', '123456789', '12345');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidRequestError);
          e.message.should.equal('User was not valid.');
          e.errors.should.eql({ message: 'User was not valid.', country_code: 'is not supported' });
        }

        Validator.prototype.validate.restore();
      });
    });
  });

  describe('#verifyToken', function() {
    describe('client validation', function() {
      it('should throw an error if `authy_id` is missing', function *() {
        try {
          yield client.verifyToken(undefined, 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `authy_id` is invalid', function *() {
        try {
          yield client.verifyToken('', 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.should.have.length(2);
          e.errors.authy_id[0].show().assert.should.equal('Required');
          e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
        }
      });

      it('should throw an error if `token` is missing', function *() {
        try {
          yield client.verifyToken(123456, undefined);

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.token.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `token` is invalid', function *() {
        try {
          yield client.verifyToken(123456, '');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.token.should.have.length(2);
          e.errors.token[0].show().assert.should.equal('Required');
          e.errors.token[1].show().assert.should.equal('TotpToken');
        }
      });

      it('should throw an error if `force` is invalid', function *() {
        try {
          yield client.verifyToken(123456, 'foobar', { force: 'true' });

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.force.should.have.length(1);
          e.errors.force[0].show().assert.should.equal('Callback');
        }
      });
    });

    describe('remote validation', function() {
      it('should throw an error if the `token` is invalid', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.verifyToken.fail();

        try {
          yield client.verifyToken(1635, 'foo');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidTokenError);
          e.message.should.equal('Token is invalid.');
          e.body.should.not.be.empty;
        }

        Validator.prototype.validate.restore();
      });

      it('should throw an error if the `token` has been used recently', function *() {
        mocks.verifyToken.failWithRecentlyUsed();

        try {
          yield client.verifyToken(1635, '0601338');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyInvalidTokenUsedRecentlyError);
          e.message.should.equal('Token is invalid. Token was used recently.');
          e.body.should.not.be.empty;
        }
      });
    });

    it('should accept a `force` parameter', function *() {
      mocks.verifyToken.succeedWithForce();

      yield client.verifyToken(1635, '1234567', { force: true });
    });

    it('should not throw an error if the `token` is valid', function *() {
      mocks.verifyToken.succeed();

      yield client.verifyToken(1635, '1234567');
    });
  });

  describe('#requestSms', function() {
    describe('client validation', function() {
      it('should throw an error if `authy_id` is missing', function *() {
        try {
          yield client.requestSms(undefined, 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `authy_id` is invalid', function *() {
        try {
          yield client.requestSms('', 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.should.have.length(2);
          e.errors.authy_id[0].show().assert.should.equal('Required');
          e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
        }
      });

      it('should throw an error if `force` is invalid', function *() {
        try {
          yield client.requestSms(123456, { force: 'true' });

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.force.should.have.length(1);
          e.errors.force[0].show().assert.should.equal('Callback');
        }
      });

      it('should throw an error if `shortcode` is invalid', function *() {
        try {
          yield client.requestSms(123456, { shortcode: 'true' });

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.shortcode.should.have.length(1);
          e.errors.shortcode[0].show().assert.should.equal('Callback');
        }
      });
    });

    describe('remote validation', function() {
      it('should throw an error if the `authy_id` is invalid ', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.requestSms.failWithInvalidAuthyId();

        try {
          yield client.requestSms(1600);
        } catch (e) {
          e.should.be.instanceOf(AuthyHttpError);
          e.message.should.equal('User not found.');
          e.body.should.not.be.empty;
        }

        Validator.prototype.validate.restore();
      });
    });

    it('should throw an error if a `cellphone` is not returned', function *() {
      mocks.requestSms.succeedWithMissingCellphone();

      try {
        yield client.requestSms(1635);
      } catch (e) {
        e.should.be.instanceOf(AuthyError);
        e.message.should.equal('`cellphone` is missing');
        e.body.should.not.be.empty;
      }
    });

    it('should not throw an error if SMS request has been ignored', function *() {
      mocks.requestSms.succeedWithIgnoredSms();

      yield client.requestSms(1635);
    });

    it('should accept a `force` parameter', function *() {
      mocks.requestSms.succeedWithForce();

      yield client.requestSms(1635, { force: true });
    });

    it('should accept a `shortcode` parameter', function *() {
      mocks.requestSms.succeedWithShortcode();

      yield client.requestSms(1635, { shortcode: true });
    });

    it('should send an SMS token', function *() {
      mocks.requestSms.succeed();

      yield client.requestSms(1635);
    });
  });

  describe('#requestCall', function() {
    describe('client validation', function() {
      it('should throw an error if `authy_id` is missing', function *() {
        try {
          yield client.requestCall(undefined, 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `authy_id` is invalid', function *() {
        try {
          yield client.requestCall('', 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.should.have.length(2);
          e.errors.authy_id[0].show().assert.should.equal('Required');
          e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
        }
      });

      it('should throw an error if `force` is invalid', function *() {
        try {
          yield client.requestCall(123456, { force: 'true' });

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.force.should.have.length(1);
          e.errors.force[0].show().assert.should.equal('Callback');
        }
      });
    });

    describe('remote validation', function() {
      it('should throw an error if the `authy_id` is invalid ', function *() {
        sinon.stub(Validator.prototype, 'validate', function() { return true; });

        mocks.requestCall.failWithInvalidAuthyId();

        try {
          yield client.requestCall(1600);
        } catch (e) {
          e.should.be.instanceOf(AuthyHttpError);
          e.message.should.equal('User not found.');
          e.body.should.not.be.empty;
        }

        Validator.prototype.validate.restore();
      });
    });

    it('should throw an error if a `cellphone` is not returned', function *() {
      mocks.requestCall.succeedWithMissingCellphone();

      try {
        yield client.requestCall(1635);
      } catch (e) {
        e.should.be.instanceOf(AuthyError);
        e.message.should.equal('`cellphone` is missing');
        e.body.should.not.be.empty;
      }
    });

    it('should not throw an error if call request has been ignored', function *() {
      mocks.requestCall.succeedWithIgnoredCall();

      yield client.requestCall(1635);
    });

    it('should accept a `force` parameter', function *() {
      mocks.requestCall.succeedWithForce();

      yield client.requestCall(1635, { force: true });
    });

    it('should call a cellphone', function *() {
      mocks.requestCall.succeed();

      yield client.requestCall(1635);
    });
  });

  describe('#deleteUser', function() {
    describe('client validation', function() {
      it('should throw an error if `authy_id` is missing', function *() {
        try {
          yield client.deleteUser(undefined);

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `authy_id` is invalid', function *() {
        try {
          yield client.deleteUser('');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.should.have.length(2);
          e.errors.authy_id[0].show().assert.should.equal('Required');
          e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
        }
      });
    });

    it('should not throw an error if the user is deleted', function *() {
      mocks.deleteUser.succeed();

      yield client.deleteUser(1635);
    });
  });

  describe('#getUserStatus', function() {
    describe('client validation', function() {
      it('should throw an error if `authy_id` is missing', function *() {
        try {
          yield client.getUserStatus(undefined);

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `authy_id` is invalid', function *() {
        try {
          yield client.getUserStatus('');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.should.have.length(2);
          e.errors.authy_id[0].show().assert.should.equal('Required');
          e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
        }
      });
    });

    it('should return the user status', function *() {
      mocks.userStatus.succeed();

      (yield client.getUserStatus(1635)).should.have.keys('success', 'message', 'status');
    });
  });

  describe('#registerActivity', function() {
    describe('client validation', function() {
      it('should throw an error if `authy_id` is missing', function *() {
        try {
          yield client.registerActivity(undefined, 'banned', '86.112.56.34', { reason: 'foo' });

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.show().assert.should.equal('HaveProperty');
        }
      });

      it('should throw an error if `authy_id` is invalid', function *() {
        try {
          yield client.requestCall('', 'foobar');

          should.fail();
        } catch (e) {
          e.should.be.instanceOf(AuthyValidationFailedError);
          e.errors.authy_id.should.have.length(2);
          e.errors.authy_id[0].show().assert.should.equal('Required');
          e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
        }
      });
    });

    it('should throw an error if `type` is missing', function *() {
      try {
        yield client.registerActivity(123456, undefined, '86.112.56.34', { reason: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.type.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `type` is invalid', function *() {
      try {
        yield client.registerActivity(123456, 'kicked', '86.112.56.34', { reason: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.type.should.have.length(1);
        e.errors.type[0].show().assert.should.equal('Choice');
      }
    });

    it('should throw an error if `ip` is missing', function *() {
      try {
        yield client.registerActivity(123456, 'banned', undefined, { reason: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.ip.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `ip` is invalid', function *() {
      try {
        yield client.registerActivity(123456, 'banned', 'x.y.z.a', { reason: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.ip.should.have.length(1);
        e.errors.ip[0].show().assert.should.equal('Callback');
      }
    });

    it('should throw an error if `data` is missing', function *() {
      try {
        yield client.registerActivity(123456, 'banned', '86.112.56.34', undefined);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(AuthyValidationFailedError);
        e.errors.data.show().assert.should.equal('HaveProperty');
      }
    });

    it('should register the activity', function *() {
      mocks.registerActivity.succeed({
        matchBody: {
          'ip': '86.112.56.34',
          'type': 'banned',
          'data[reason]': 'foo'
        }
      });

      yield client.registerActivity(1635, 'banned', '86.112.56.34', { reason: 'foo' });
    });
  });

  describe('#getApplicationDetails', function() {
    it('should return the application details', function *() {
      mocks.applicationDetails.succeed();

      (yield client.getApplicationDetails()).should.have.keys('message', 'success', 'app');
    });
  });

  describe('#getApplicationStatistics', function() {
    it('should return the application statistics', function *() {
      mocks.applicationStatistics.succeed();

      (yield client.getApplicationStatistics()).should.have.keys('message', 'count', 'total_users', 'app_id', 'success', 'stats');
    });
  });
});
