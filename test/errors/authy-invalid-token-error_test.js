
/**
 * Module dependencies.
 */

var AuthyInvalidTokenError = require('../../errors/authy-invalid-token-error');
var AuthyUnauthorizedAccessError = require('../../errors/authy-unauthorized-access-error');

/**
 * Test `AuthyInvalidTokenError`.
 */

describe('AuthyInvalidTokenError', function() {
  it('should inherit from `AuthyUnauthorizedAccessError`', function() {
    var error = new AuthyInvalidTokenError();

    error.should.be.instanceOf(AuthyUnauthorizedAccessError);
  });
});
