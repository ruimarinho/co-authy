
/**
 * Test dependencies
 */

require('should');

var AuthyInvalidApiKeyError = require('../../errors/authy-invalid-token-error');
var AuthyUnauthorizedAccessError = require('../../errors/authy-unauthorized-access-error');

describe('AuthyInvalidApiKeyError', function() {
  it('should inherit from `AuthyUnauthorizedAccessError`', function() {
    var error = new AuthyInvalidApiKeyError();

    error.should.be.instanceOf(AuthyUnauthorizedAccessError);
  });
});
