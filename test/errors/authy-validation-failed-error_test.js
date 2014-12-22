
/**
 * Module dependencies.
 */

var AuthyError = require('../../lib/errors/authy-error');
var AuthyValidationFailedError = require('../../lib/errors/authy-validation-failed-error');

/**
 * Test `AuthyValidationFailedError`.
 */

describe('AuthyValidationFailedError', function() {
  it('should inherit from `AuthyError`', function() {
    var error = new AuthyValidationFailedError();

    error.should.be.instanceOf(AuthyError);
  });

  it('should have a default message', function() {
    var error = new AuthyValidationFailedError();

    error.message.should.equal('Validation failed');
  });

  it('should accept a list of `errors`', function() {
    var error = new AuthyValidationFailedError({ foo: 'bar' });

    error.errors.should.eql({ foo: 'bar' });
  });
});
