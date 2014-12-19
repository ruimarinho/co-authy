
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../errors/authy-http-error');
var AuthyUserNotFoundError = require('../../errors/authy-user-not-found-error');

/**
 * Test `AuthyUserNotFoundError`.
 */

describe('AuthyUserNotFoundError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyUserNotFoundError();

    error.should.be.instanceOf(AuthyHttpError);
  });
});
