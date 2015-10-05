
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../lib/errors/authy-http-error');
var AuthyUserSuspendedError = require('../../lib/errors/authy-user-suspended-error');

/**
 * Test `AuthyUserSuspendedError`.
 */

describe('AuthyUserSuspendedError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyUserSuspendedError();

    error.should.be.instanceOf(AuthyHttpError);
  });

  it('should have a default message', function() {
    var error = new AuthyUserSuspendedError();

    error.message.should.equal('User suspended');
  });

  it('should accept a `body`', function() {
    var error = new AuthyUserSuspendedError({ foo: 'bar' });

    error.body.should.eql({ foo: 'bar' });
  });
});
