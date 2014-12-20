
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../errors/authy-unauthorized-access-error');
var AuthyInvalidApiKeyError = require('../errors/authy-invalid-api-key-error');
var AuthyInvalidRequestError = require('../errors/authy-invalid-request-error');
var AuthyInvalidTokenError = require('../errors/authy-invalid-token-error');
var AuthyInvalidTokenUsedRecentlyError = require('../errors/authy-invalid-token-used-recently-error');
var AuthyServiceUnavailableError = require('../errors/authy-service-unavailable-error');
var AuthyUnauthorizedAccessError = require('../errors/authy-unauthorized-access-error');
var AuthyUserSuspendedError = require('../errors/authy-user-suspended-error');
var parse = require('../lib/response');

/**
 * Test `Response`.
 */

describe('Response', function() {
  describe('parse()', function() {
    it('should support a string body', function() {
      var body = 'Requested URL was not found. Please check http://docs.authy.com/ to see the valid URLs';
      var statusCode = 401;

      try {
        parse({ body: body, statusCode: statusCode });
      } catch (e) {
        e.body.should.equal(body);
        e.message.should.equal('Unauthorized access');
        e.should.be.instanceOf(AuthyUnauthorizedAccessError);
      }
    });

    it('should fallback to an `HttpError` if no special error is thrown', function() {
        var statusCode = 200;
        var body = 'Foo';

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body);
          e.should.be.instanceOf(AuthyHttpError);
        }
    });

    describe('status code 503', function() {
      var statusCode = 503;

      it('should throw an `AuthyServiceUnavailableError`', function() {
        var body = { message: 'Rate limit exceeded' };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyServiceUnavailableError);
        }
      });

      it('should throw an `AuthyUserSuspendedError`', function() {
        var body = { message: 'User has been suspended.' };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyUserSuspendedError);
        }
      });
    });

    describe('status code 401', function() {
      var statusCode = 401;

      it('should throw an `AuthyInvalidTokenUsedRecentlyError` if verification token has been used recently', function() {
        var body = {
          message: 'Token is invalid. Token was used recently.',
          success: false,
          errors: {
            message: 'Token is invalid. Token was used recently.'
          }
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyInvalidTokenUsedRecentlyError);
        }
      });

      it('should throw an `AuthyInvalidTokenError` if token is invalid', function() {
        var body = {
          message: 'Token is invalid.',
          token: 'is invalid',
          success: false,
          errors: {
            message: 'Token is invalid.'
           }
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyInvalidTokenError);
        }
      });

      it('should throw an `AuthyInvalidApiKeyError` if api key is invalid', function() {
        var body = {
          message: 'Invalid API key.',
          success: false,
          errors: {
            message: 'Invalid API key.'
          }
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyInvalidApiKeyError);
        }
      });

      it('should throw an `AuthyUnauthorizedAccessError` as a fallback', function() {
        var body = {
          errors: {
            message: 'A specially unknown message.'
          },
          message: 'A specially unknown message.',
          success: false
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyUnauthorizedAccessError);
        }
      });
    });

    describe('status code 400', function() {
      var statusCode = 400;

      it('should throw an `AuthyInvalidRequestError`', function() {
        var body =  {
          email: 'is invalid and can\'t be blank',
          errors: {
            message: 'User was not valid.',
            email: 'is invalid and can\'t be blank'
          },
          message: 'User was not valid.',
          success: false
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.body.should.equal(body);
          e.message.should.equal(body.message);
          e.should.be.instanceOf(AuthyInvalidRequestError);
        }
      });
    });
  });
});