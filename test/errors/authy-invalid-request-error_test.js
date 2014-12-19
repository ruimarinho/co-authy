
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../errors/authy-unauthorized-access-error');
var AuthyInvalidTokenError = require('../../errors/authy-invalid-token-error');

/**
 * Test `AuthyInvalidRequestError`.
 */

describe('AuthyInvalidRequestError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyInvalidTokenError();

    error.should.be.instanceOf(AuthyHttpError);
  });
});
