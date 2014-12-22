
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../lib/errors/authy-http-error');
var AuthyUnauthorizedAccessError = require('../../lib/errors/authy-unauthorized-access-error');

/**
 * Test `AuthyUnauthorizedAccessError`.
 */

describe('AuthyUnauthorizedAccessError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyUnauthorizedAccessError();

    error.should.be.instanceOf(AuthyHttpError);
  });

  it('should have a default message', function() {
    var error = new AuthyUnauthorizedAccessError();

    error.message.should.equal('Unauthorized access');
  });

  it('should accept a `body`', function() {
    var error = new AuthyUnauthorizedAccessError({ foo: 'bar' });

    error.body.should.eql({ foo: 'bar' });
  });
});
