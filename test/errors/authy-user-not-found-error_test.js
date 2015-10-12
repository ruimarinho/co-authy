
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../lib/errors/authy-http-error');
var AuthyUserNotFoundError = require('../../lib/errors/authy-user-not-found-error');

/**
 * Test `AuthyUserNotFoundError`.
 */

describe('AuthyUserNotFoundError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyUserNotFoundError();

    error.should.be.instanceOf(AuthyHttpError);
  });

  it('should have a default message', function() {
    var error = new AuthyUserNotFoundError();

    error.message.should.equal('User not found');
  });

  it('should accept a `body`', function() {
    var error = new AuthyUserNotFoundError({ foo: 'bar' });

    error.body.should.eql({ foo: 'bar' });
  });
});
