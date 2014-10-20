
/**
 * Test dependencies
 */

require('should');

var AuthyInvalidTokenError = require('../../errors/authy-unauthorized-access-error');
var AuthyInvalidTokenUsedRecentlyError = require('../../errors/authy-invalid-token-used-recently-error');

describe('AuthyInvalidTokenUsedRecentlyError', function() {
  it('should inherit from `AuthyInvalidTokenError`', function() {
    var error = new AuthyInvalidTokenUsedRecentlyError();

    error.should.be.instanceOf(AuthyInvalidTokenError);
  });
});
