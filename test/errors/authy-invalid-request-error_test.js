
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../lib/errors/authy-unauthorized-access-error');
var AuthyInvalidTokenError = require('../../lib/errors/authy-invalid-token-error');

/**
 * Test `AuthyInvalidRequestError`.
 */

describe('AuthyInvalidRequestError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyInvalidTokenError();

    error.should.be.instanceOf(AuthyHttpError);
  });
});
