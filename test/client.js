var AuthyClient = require('..');
var AuthyError = require('../errors/authy-error');
var HttpAuthyError = require('../errors/http-authy-error');
var InvalidRequestAuthyError = require('../errors/invalid-request-authy-error');
var InvalidTokenAuthyError = require('../errors/invalid-token-authy-error');
var UnauthorizedAccessAuthyError = require('../errors/unauthorized-access-authy-error');
var ValidationFailedAuthyError = require('../errors/validation-failed-authy-error');
var Validator = require('validator.js').Validator;
var client = new AuthyClient(process.env.AUTHY_KEY || 'fooqux', 'http://sandbox-api.authy.com');
var nock = require('nock');
var should = require('should');
var sinon = require('sinon');

describe('client', function() {
  describe('constructor', function() {
    it('should throw an error if `apiKey` is missing', function() {
      try {
        new AuthyClient(undefined, 'http://sandbox-api.authy.com');
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.api_key.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `apiUrl` is missing', function() {
      try {
        new AuthyClient('foo', undefined);
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.api_url.show().assert.should.equal('HaveProperty');
      }
    });

    it('should allow initialization without the `new` keyword', function() {
      var validClient = AuthyClient('foo', 'http://sandbox-api.authy.com');

      validClient.apiKey.should.equal('foo');
      validClient.apiUrl.should.equal('http://sandbox-api.authy.com');
    });
  });

  describe('config', function() {
    it('should throw an error if the api `key` is invalid', function *() {
      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=foo', {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '408-550-3542',
          'user[country_code]': '1'
        })
        .reply(401, {
          message: 'Invalid API key.',
          success: false,
          errors: {
            message: 'Invalid API key.'
           }
        });

      var clientWithInvalidKey = new AuthyClient('foo', 'http://sandbox-api.authy.com');

      try {
        yield clientWithInvalidKey.registerUser('foo@bar.com', '408-550-3542');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(UnauthorizedAccessAuthyError);
        e.message.should.equal('Invalid API key.');
        e.body.should.eql({
          message: 'Invalid API key.',
          success: false,
          errors: {
            message: 'Invalid API key.'
           }
        });
      }
    });
  });
});

describe('registerUser()', function() {
  it('should support `country_code` in the ISO 3166-1 alpha-2 format', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    yield client.registerUser('foo@bar.com', '911234567', 'PT');
  });

  it('should support `country_code` in the ISO 3166-1 alpha-3 numeric format', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    yield client.registerUser('foo@bar.com', '911234567', 'PRT');
  });

  it('should support the special International Networks `country_code` (+882)', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '13300655',
        'user[country_code]': '882'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

      yield client.registerUser('foo@bar.com', '13300655', '882');
  });

  it('should support the special International Networks `country_code` (+883)', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '510012345',
        'user[country_code]': '883'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    yield client.registerUser('foo@bar.com', '510012345', '883');
  });

  it('should default the `country_code` to USA (+1) if it is missing', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '5627562233',
        'user[country_code]': '1'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    yield client.registerUser('foo@bar.com', '5627562233');
  });

  it('should throw an error if the authy `id` is not returned', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          authy_id: 1
        }
      });

    try {
      yield client.registerUser('foo@bar.com', '911234567', '351');
    } catch (e) {
      e.should.be.instanceOf(AuthyError);
      e.message.should.equal('`user.id` is missing');
      e.body.should.eql({ user: { authy_id: 1 }});
    }
  });

  it('should return the authy `id`', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');

    response.user.id.should.equal(1635);
  });

  describe('client validation', function() {
    it('should throw an error if `email` is missing', function *() {
      try {
        yield client.registerUser(undefined, '123456789');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.email.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `email` is invalid', function *() {
      try {
        yield client.registerUser('foo', '123456789');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.email.should.have.length(1);
        e.errors.email[0].show().assert.should.equal('Email');
      }
    });

    it('should throw an error if `cellphone` is missing', function *() {
      try {
        yield client.registerUser('foo@bar.com');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.cellphone.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `cellphone` invalid', function *() {
      try {
        yield client.registerUser('foo@bar.com', 'FOO', '351');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.cellphone.should.have.length(1);
        e.errors.cellphone[0].show().assert.should.equal('PhoneNumber');
      }
    });

    it('should throw an error if `cellphone` is invalid', function *() {
      try {
        yield client.registerUser('foo@bar.com', '');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.cellphone[0].show().assert.should.equal('Required');
      }
    });

    it('should throw an error if `country_code` is not supported', function *() {
      try {
        yield client.registerUser('foo@bar.com', '123456789', '12345');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.country_code.should.have.length(1);
        e.errors.country_code[0].show().assert.should.equal('Choice');
      }
    });
  });

  describe('remote validation', function() {
    it('should throw an error if `email` is missing', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=fooqux', {
          'user[email]': '',
          'user[cellphone]': '123456789',
          'user[country_code]': '351'
        })
        .reply(400, {
          message: 'User was not valid.',
          email: 'is invalid and can\'t be blank',
          success: false,
          errors: {
            message: 'User was not valid.',
            email: 'is invalid and can\'t be blank'
          }
        });

      try {
        yield client.registerUser('', '123456789', '351');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(InvalidRequestAuthyError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', email: 'is invalid and can\'t be blank' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `email` is invalid', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=fooqux', {
          'user[email]': 'foo',
          'user[cellphone]': '123456789',
          'user[country_code]': '351'
        })
        .reply(400, {
          message: 'User was not valid.',
          email: 'is invalid',
          success: false,
          errors: {
            message: 'User was not valid.',
            email: 'is invalid'
          }
        });

      try {
        yield client.registerUser('foo', '123456789', '351');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(InvalidRequestAuthyError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', email: 'is invalid' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `cellphone` is missing', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=fooqux', {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '',
          'user[country_code]': '351'
        })
        .reply(400, {
          message: 'User was not valid.',
          cellphone: 'is invalid',
          success: false,
          errors: {
            message: 'User was not valid.',
            cellphone: 'is invalid'
           }
        });

      try {
        yield client.registerUser('foo@bar.com', '', '351');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(InvalidRequestAuthyError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', cellphone: 'is invalid' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `cellphone` is invalid', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=fooqux', {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': 'FOO',
          'user[country_code]': '351'
       })
       .reply(400, {
          message: 'User was not valid.',
          cellphone: 'is invalid',
          success: false,
          errors: {
            message: 'User was not valid.',
            cellphone: 'is invalid'
          }
      });

      try {
        yield client.registerUser('foo@bar.com', 'FOO', '351');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(InvalidRequestAuthyError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', cellphone: 'is invalid' });
      }

      Validator.prototype.validate.restore();
    });

    it('should throw an error if `country_code` is not supported', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=fooqux', {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '123456789',
          'user[country_code]': '12345'
        })
        .reply(400, {
          message: 'User was not valid.',
          country_code: 'is not supported',
          success: false,
          errors: {
            message: 'User was not valid.',
            country_code: 'is not supported'
          }
        });

      try {
        yield client.registerUser('foo@bar.com', '123456789', '12345');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(InvalidRequestAuthyError);
        e.message.should.equal('User was not valid.');
        e.errors.should.eql({ message: 'User was not valid.', country_code: 'is not supported' });
      }

      Validator.prototype.validate.restore();
    });
  });
});

describe('verifyToken()', function() {
  describe('client validation', function() {
    it('should throw an error if `authy_id` is missing', function *() {
      try {
        yield client.verifyToken(undefined, 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authy_id` is invalid', function *() {
      try {
        yield client.verifyToken('', 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
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
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.token.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `token` is invalid', function *() {
      try {
        yield client.verifyToken(123456, '');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.token.should.have.length(2);
        e.errors.token[0].show().assert.should.equal('Required');
        e.errors.token[1].show().assert.should.equal('NotBlank');
      }
    });

    it('should throw an error if `force` is invalid', function *() {
      try {
        yield client.verifyToken(123456, 'foobar', { force: 'true' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.force.should.have.length(1);
        e.errors.force[0].show().assert.should.equal('Callback');
      }
    });
  });

  describe('remote validation', function() {
    it('should throw an error if the `token` is invalid', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .post('/protected/json/users/new?api_key=fooqux', {
          'user[email]': 'foo@bar.com',
          'user[cellphone]': '911234567',
          'user[country_code]': '351'
        })
        .reply(200, {
          user: {
            id: 1
          }
        });

      var response = yield client.registerUser('foo@bar.com', '911234567', '351');
      var authyId = response.user.id;

      nock('http://sandbox-api.authy.com')
        .get('/protected/json/verify/foo/' + authyId + '?api_key=fooqux')
        .reply(401, {
          message: 'Token is invalid.',
          token: 'is invalid',
          success: false,
          errors: {
            message: 'Token is invalid.'
           }
        });

      try {
        yield client.verifyToken(authyId, 'foo');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(InvalidTokenAuthyError);
      }

      Validator.prototype.validate.restore();
    });
  });

  it('should accept a `force` parameter', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;
    var validToken = '1234567';

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/verify/' + validToken + '/' + authyId + '?api_key=fooqux&force=true')
      .reply(200, {
        success: true,
        token: 'is valid',
        message: 'Token is valid.'
      });

    yield client.verifyToken(authyId, validToken, { force: true });
  });

  it('should not throw an error if the `token` is valid', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;
    var validToken = '1234567';

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/verify/' + validToken + '/' + authyId + '?api_key=fooqux')
      .reply(200, {
        success: true,
        token: 'is valid',
        message: 'Token is valid.'
      });

    yield client.verifyToken(authyId, validToken);
  });
});

describe('requestSms()', function() {
  describe('client validation', function() {
    it('should throw an error if `authy_id` is missing', function *() {
      try {
        yield client.requestSms(undefined, 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authy_id` is invalid', function *() {
      try {
        yield client.requestSms('', 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
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
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.force.should.have.length(1);
        e.errors.force[0].show().assert.should.equal('Callback');
      }
    });

    it('should throw an error if `shortcode` is invalid', function *() {
      try {
        yield client.requestSms(123456, { shortcode: 'true' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.shortcode.should.have.length(1);
        e.errors.shortcode[0].show().assert.should.equal('Callback');
      }
    });
  });

  describe('remote validation', function() {
    it('should throw an error if the `authy_id` is invalid ', function *() {
      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      var invalidAuthyId = 'FOO';

      nock('http://sandbox-api.authy.com')
        .get('/protected/json/sms/' + invalidAuthyId + '?api_key=fooqux&force=true')
        .reply(404, {
          message: 'User not found.',
          success: false,
          errors: {
            message: 'User not found.'
          }
        });

      try {
        yield client.requestSms(invalidAuthyId, { force: true });
      } catch (e) {
        e.should.be.instanceOf(HttpAuthyError);
        e.message.should.equal('User not found.');
        e.body.should.eql({
          message: 'User not found.',
          success: false,
          errors: {
            message: 'User not found.'
          }
        });
      }

      Validator.prototype.validate.restore();
    });
  });

  it('should throw an error if a `cellphone` is not returned', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/sms/' + authyId + '?api_key=fooqux')
      .reply(200, {
        ignored: 'SMS is not needed for smartphones. Pass force=true if you want to actually send it anyway.',
      });

    try {
      yield client.requestSms(authyId);
    } catch (e) {
      e.should.be.instanceOf(AuthyError);
      e.message.should.equal('`cellphone` is missing');
      e.body.should.eql({
        ignored: 'SMS is not needed for smartphones. Pass force=true if you want to actually send it anyway.',
      });
    }
  });

  it('should accept a `force` parameter', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/sms/' + authyId + '?api_key=fooqux&force=true')
      .reply(200, {
        success: true,
        cellphone: '+351-XXX-XXX-XX67',
        message: 'SMS token was sent'
      });

    var response = yield client.requestSms(authyId, { force: true });
    response.should.eql({
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS token was sent'
    });
  });

  it('should accept a `shortcode` parameter', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/sms/' + authyId + '?api_key=fooqux&shortcode=true')
      .reply(200, {
        success: true,
        cellphone: '+351-XXX-XXX-XX67',
        message: 'SMS token was sent'
      });

    response = yield client.requestSms(authyId, { shortcode: true });
    response.should.eql({
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS token was sent'
    });
  });

  it('should send an SMS token', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/sms/' + authyId + '?api_key=fooqux')
      .reply(200, {
        success: true,
        cellphone: '+351-XXX-XXX-XX67',
        message: 'SMS token was sent'
      });

    response = yield client.requestSms(authyId);
    response.should.eql({
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS token was sent'
    });
  });
});

describe('requestCall()', function() {
  describe('client validation', function() {
    it('should throw an error if `authy_id` is missing', function *() {
      try {
        yield client.requestCall(undefined, 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authy_id` is invalid', function *() {
      try {
        yield client.requestCall('', 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
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
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.force.should.have.length(1);
        e.errors.force[0].show().assert.should.equal('Callback');
      }
    });
  });

  describe('remote validation', function() {
    it('should throw an error if the `authy_id` is invalid ', function *() {
      var invalidAuthyId = 'FOO';

      sinon.stub(Validator.prototype, 'validate', function() { return true; });

      nock('http://sandbox-api.authy.com')
        .get('/protected/json/call/' + invalidAuthyId + '?api_key=fooqux&force=true')
        .reply(404, {
          message: 'User not found.',
          success: false,
          errors: {
            message: 'User not found.'
          }
        });

      try {
        yield client.requestCall(invalidAuthyId, { force: true });
      } catch (e) {
        e.should.be.instanceOf(HttpAuthyError);
        e.message.should.equal('User not found.');
        e.body.should.eql({
          message: 'User not found.',
          success: false,
          errors: {
            message: 'User not found.'
          }
        });
      }

      Validator.prototype.validate.restore();
    });
  });

  it('should throw an error if a `cellphone` is not returned', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/call/' + authyId + '?api_key=fooqux')
      .reply(200, {
        ignored: 'Call ignored. User is using App Tokens and this call is not necessary. Pass force=true if you still want to call users that are using the App.',
      });

    try {
      yield client.requestCall(authyId);
    } catch (e) {
      e.should.be.instanceOf(AuthyError);
      e.message.should.equal('`cellphone` is missing');
      e.body.should.eql({
        ignored: 'Call ignored. User is using App Tokens and this call is not necessary. Pass force=true if you still want to call users that are using the App.',
      });
    }
  });

  it('should accept a `force` parameter', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/call/' + authyId + '?api_key=fooqux&force=true')
      .reply(200, {
        success: true,
        cellphone: '+351-XXX-XXX-XX67',
        message: 'Call started.'
      });

    response = yield client.requestCall(authyId, { force: true });
    response.should.eql({
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'Call started.'
    });
  });

  it('should call a cellphone', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/call/' + authyId + '?api_key=fooqux')
      .reply(200, {
        success: true,
        cellphone: '+351-XXX-XXX-XX67',
        message: 'Call started.'
      });

    response = yield client.requestCall(authyId);
    response.should.eql({
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'Call started.'
    });
  });
});

describe('deleteUser()', function() {
  describe('client validation', function() {
    it('should throw an error if `authy_id` is missing', function *() {
      try {
        yield client.deleteUser(undefined);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authy_id` is invalid', function *() {
      try {
        yield client.deleteUser('');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.should.have.length(2);
        e.errors.authy_id[0].show().assert.should.equal('Required');
        e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
      }
    });
  });

  it('should not throw an error if the user is deleted', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/delete/' + authyId + '?api_key=fooqux')
      .reply(200, {
        success: true,
        message: 'User was added to remove.'
      });

    yield client.deleteUser(authyId);
  });
});

describe('getUserStatus()', function() {
  describe('client validation', function() {
    it('should throw an error if `authy_id` is missing', function *() {
      try {
        yield client.getUserStatus(undefined);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authy_id` is invalid', function *() {
      try {
        yield client.getUserStatus('');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.should.have.length(2);
        e.errors.authy_id[0].show().assert.should.equal('Required');
        e.errors.authy_id[1].show().assert.should.equal('GreaterThan');
      }
    });
  });

  it('should return the user status', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .get('/protected/json/users/' + authyId + '/status?api_key=fooqux')
      .reply(200, {
        success: true,
        message: 'User status.',
        status: {
          authy_id: 1635,
          confirmed: true,
          registered: false,
          country_code: 351,
          phone_number: 'XX-XXX-4567',
          devices: []
        }
      });

    var result = yield client.getUserStatus(authyId);

    result.should.eql({
      success: true,
      message: 'User status.',
        status: {
          authy_id: 1635,
          confirmed: true,
          registered: false,
          country_code: 351,
          phone_number: 'XX-XXX-4567',
          devices: []
        }
      });
  });
});

describe('registerActivity()', function() {
  describe('client validation', function() {
    it('should throw an error if `authy_id` is missing', function *() {
      try {
        yield client.registerActivity(undefined, 'banned', '86.112.56.34', { reason: 'foo' });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
        e.errors.authy_id.show().assert.should.equal('HaveProperty');
      }
    });

    it('should throw an error if `authy_id` is invalid', function *() {
      try {
        yield client.requestCall('', 'foobar');

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedAuthyError);
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
      e.should.be.instanceOf(ValidationFailedAuthyError);
      e.errors.type.show().assert.should.equal('HaveProperty');
    }
  });

  it('should throw an error if `type` is invalid', function *() {
    try {
      yield client.registerActivity(123456, 'kicked', '86.112.56.34', { reason: 'foo' });

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(ValidationFailedAuthyError);
      e.errors.type.should.have.length(1);
      e.errors.type[0].show().assert.should.equal('Choice');
    }
  });

  it('should throw an error if `ip` is missing', function *() {
    try {
      yield client.registerActivity(123456, 'banned', undefined, { reason: 'foo' });

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(ValidationFailedAuthyError);
      e.errors.ip.show().assert.should.equal('HaveProperty');
    }
  });

  it('should throw an error if `ip` is invalid', function *() {
    try {
      yield client.registerActivity(123456, 'banned', 'x.y.z.a', { reason: 'foo' });

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(ValidationFailedAuthyError);
      e.errors.ip.should.have.length(1);
      e.errors.ip[0].show().assert.should.equal('Callback');
    }
  });

  it('should throw an error if `data` is missing', function *() {
    try {
      yield client.registerActivity(123456, 'banned', '86.112.56.34', undefined);

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(ValidationFailedAuthyError);
      e.errors.data.show().assert.should.equal('HaveProperty');
    }
  });

  it('should register the activity', function *() {
    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/new?api_key=fooqux', {
        'user[email]': 'foo@bar.com',
        'user[cellphone]': '911234567',
        'user[country_code]': '351'
      })
      .reply(200, {
        user: {
          id: 1635
        }
      });

    var response = yield client.registerUser('foo@bar.com', '911234567', '351');
    var authyId = response.user.id;

    nock('http://sandbox-api.authy.com')
      .post('/protected/json/users/' + authyId + '/register_activity?api_key=fooqux', {
        'ip': '86.112.56.34',
        'type': 'banned',
        'data[reason]': 'foo'
     })
     .reply(200, {
        message: 'Activity was created.',
        success: true
    });

    yield client.registerActivity(authyId, 'banned', '86.112.56.34', { reason: 'foo' });
  });
});

describe('getApplicationDetails()', function() {
  it('should return the application details', function *() {
    nock('http://sandbox-api.authy.com')
      .get('/protected/json/app/details?api_key=fooqux')
      .reply(200, {
        message: 'Application information.',
        success: true,
        app: {
          name: 'Sandbox App 2',
          plan: 'starter',
          sms_enabled: false,
          white_label: false,
          app_id: 3
        }
      });

    var response = yield client.getApplicationDetails();
    response.should.eql({
      message: 'Application information.',
      success: true,
      app: {
        name: 'Sandbox App 2',
        plan: 'starter',
        sms_enabled: false,
        white_label: false,
        app_id: 3
      }
     });
  });
});

describe('getApplicationStatistics()', function() {
  it('should return the application statistics', function *() {
    nock('http://sandbox-api.authy.com')
      .get('/protected/json/app/stats?api_key=fooqux')
      .reply(200, {
        message: 'Monthly statistics.',
        count: 12,
        total_users: 115,
        app_id: 3,
        success: true,
        stats: [
          {
            sms_count: 0,
            calls_count: 0,
            users_count: 1,
            auths_count: 0,
            month: 'August',
            api_calls_count: 13,
            year: 2013
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 1,
            auths_count: 0,
            month: 'September',
            api_calls_count: 30,
            year: 2013
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 2,
            auths_count: 0,
            month: 'October',
            api_calls_count: 20,
            year: 2013
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 3,
            auths_count: 0,
            month: 'November',
            api_calls_count: 50,
            year: 2013
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 7,
            auths_count: 0,
            month: 'December',
            api_calls_count: 50,
            year: 2013
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 2,
            auths_count: 0,
            month: 'January',
            api_calls_count: 8,
            year: 2014
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 3,
            auths_count: 0,
            month: 'February',
            api_calls_count: 4,
            year: 2014
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 27,
            auths_count: 0,
            month: 'March',
            api_calls_count: 208,
            year: 2014
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 17,
            auths_count: 0,
            month: 'April',
            api_calls_count: 162,
            year: 2014
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 21,
            auths_count: 0,
            month: 'May',
            api_calls_count: 891,
            year: 2014
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 15,
            auths_count: 0,
            month: 'June',
            api_calls_count: 2076,
            year: 2014
          }, {
            sms_count: 0,
            calls_count: 0,
            users_count: 1,
            auths_count: 0,
            month: 'July',
            api_calls_count: 130,
            year: 2014
          }
        ]
      });

    var response = yield client.getApplicationStatistics();
    response.should.have.keys('message', 'count', 'total_users', 'app_id', 'success', 'stats');
  });
});