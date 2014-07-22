
/**
 * Test dependencies
 */

require('should');

var HttpAuthyError = require('../errors/unauthorized-access-authy-error');
var InvalidApiKeyAuthyError = require('../errors/invalid-api-key-authy-error');
var InvalidRequestAuthyError = require('../errors/invalid-request-authy-error');
var InvalidTokenAuthyError = require('../errors/invalid-token-authy-error');
var InvalidTokenUsedRecentlyAuthyError = require('../errors/invalid-token-used-recently-authy-error');
var ServiceUnavailableAuthyError = require('../errors/service-unavailable-authy-error');
var UnauthorizedAccessAuthyError = require('../errors/unauthorized-access-authy-error');
var parse = require('../lib/response');

describe('Response', function() {
  describe('#parse', function() {
    it('should support a string body', function() {
      var body = 'Requested URL was not found. Please check http://docs.authy.com/ to see the valid URLs';
      var statusCode = 401;

      try {
        parse({ body: body, statusCode: statusCode });
      } catch (e) {
        e.should.be.instanceOf(UnauthorizedAccessAuthyError);
        e.message.should.equal('Unauthorized access');
        e.body.should.equal(body);
      }
    });

    describe('status code 503', function() {
      var statusCode = 503;

      it('should throw an `ServiceUnavailableAuthyError`', function() {
        var body = { message: 'Rate limit exceeded' };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.should.be.instanceOf(ServiceUnavailableAuthyError);
          e.message.should.equal(body.message);
          e.body.should.equal(body);
        }
      });
    });

    describe('status code 401', function() {
      var statusCode = 401;

      it('should throw an `InvalidTokenUsedRecentlyAuthyError` if token has been used recently', function() {
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
          e.should.be.instanceOf(InvalidTokenUsedRecentlyAuthyError);
          e.message.should.equal(body.message);
          e.body.should.equal(body);
        }
      });

      it('should throw an `InvalidTokenAuthyError` if token is invalid', function() {
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
          e.should.be.instanceOf(InvalidTokenAuthyError);
          e.message.should.equal(body.message);
          e.body.should.equal(body);
        }
      });

      it('should throw an `InvalidApiKeyAuthyError` if API key is invalid', function() {
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
          e.should.be.instanceOf(InvalidApiKeyAuthyError);
          e.message.should.equal(body.message);
          e.body.should.equal(body);
        }
      });

      it('should throw an `UnauthorizedAccessAuthyError` as a fallback', function() {
        var body = {
          message: 'A specially unknown message.',
          success: false,
          errors: {
            message: 'A specially unknown message.'
          }
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.should.be.instanceOf(UnauthorizedAccessAuthyError);
          e.message.should.equal(body.message);
          e.body.should.equal(body);
        }
      });
    });

    describe('status code 400', function() {
      var statusCode = 400;

      it('should throw an `InvalidRequestAuthyError`', function() {
        var body =  {
          message: 'User was not valid.',
          email: 'is invalid and can\'t be blank',
          success: false,
          errors: {
            message: 'User was not valid.',
            email: 'is invalid and can\'t be blank'
          }
        };

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.should.be.instanceOf(InvalidRequestAuthyError);
          e.message.should.equal(body.message);
          e.body.should.equal(body);
        }
      });
    });

    it('should fallback to an `HttpError` if no special error is thrown', function() {
        var statusCode = 502;
        var body = 'Bad gateway';

        try {
          parse({ body: body, statusCode: statusCode });
        } catch (e) {
          e.should.be.instanceOf(HttpAuthyError);
          e.message.should.equal(body);
          e.body.should.equal(body);
        }
    });
  });
});
