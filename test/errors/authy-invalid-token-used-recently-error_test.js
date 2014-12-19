
/**
 * Module dependencies.
 */

var AuthyInvalidTokenError = require('../../errors/authy-unauthorized-access-error');
var AuthyInvalidTokenUsedRecentlyError = require('../../errors/authy-invalid-token-used-recently-error');

/**
 * Test `AuthyInvalidTokenUsedRecentlyError`.
 */

describe('AuthyInvalidTokenUsedRecentlyError', function() {
  it('should inherit from `AuthyInvalidTokenError`', function() {
    var error = new AuthyInvalidTokenUsedRecentlyError();

    error.should.be.instanceOf(AuthyInvalidTokenError);
  });
});
