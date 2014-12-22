
/**
 * Module dependencies.
 */

var AuthyInvalidApiKeyError = require('../../lib/errors/authy-invalid-token-error');
var AuthyUnauthorizedAccessError = require('../../lib/errors/authy-unauthorized-access-error');

/**
 * Test `AuthyInvalidApiKeyError`.
 */

describe('AuthyInvalidApiKeyError', function() {
  it('should inherit from `AuthyUnauthorizedAccessError`', function() {
    var error = new AuthyInvalidApiKeyError();

    error.should.be.instanceOf(AuthyUnauthorizedAccessError);
  });
});
