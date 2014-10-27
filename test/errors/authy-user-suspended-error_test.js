
/**
 * Test dependencies.
 */

require('should');

var AuthyHttpError = require('../../errors/authy-http-error');
var AuthyUserSuspendedError = require('../../errors/authy-user-suspended-error');

describe('AuthyUserSuspendedError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyUserSuspendedError();

    error.should.be.instanceOf(AuthyHttpError);
  });
});
