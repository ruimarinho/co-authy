
/**
 * Module dependencies.
 */

var AuthyInvalidTokenError = require('../../lib/errors/authy-unauthorized-access-error');
var AuthyInvalidTokenUsedRecentlyError = require('../../lib/errors/authy-invalid-token-used-recently-error');

/**
 * Test `AuthyInvalidTokenUsedRecentlyError`.
 */

describe('AuthyInvalidTokenUsedRecentlyError', function() {
  it('should inherit from `AuthyInvalidTokenError`', function() {
    var error = new AuthyInvalidTokenUsedRecentlyError();

    error.should.be.instanceOf(AuthyInvalidTokenError);
  });
});
