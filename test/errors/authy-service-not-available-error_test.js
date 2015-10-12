
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../lib/errors/authy-http-error');
var AuthyServiceUnavailableError = require('../../lib/errors/authy-service-unavailable-error');

/**
 * Test `AuthyServiceUnavailableError`.
 */

describe('AuthyServiceUnavailableError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthyServiceUnavailableError();

    error.should.be.instanceOf(AuthyHttpError);
  });

  it('should have a default message', function() {
    var error = new AuthyServiceUnavailableError();

    error.message.should.equal('Service unavailable');
  });

  it('should accept a `body`', function() {
    var error = new AuthyServiceUnavailableError({ foo: 'bar' });

    error.body.should.eql({ foo: 'bar' });
  });
});
