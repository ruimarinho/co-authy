
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../../lib/errors/authy-http-error');
var AuthySmsNotSentError = require('../../lib/errors/authy-sms-not-sent-error');

/**
 * Test `AuthySmsNotSentError`.
 */

describe('AuthySmsNotSentError', function() {
  it('should inherit from `AuthyHttpError`', function() {
    var error = new AuthySmsNotSentError();

    error.should.be.instanceOf(AuthyHttpError);
  });

  it('should have a default message', function() {
    var error = new AuthySmsNotSentError();

    error.message.should.equal('SMS not sent');
  });

  it('should accept a `body`', function() {
    var error = new AuthySmsNotSentError({ foo: 'bar' });

    error.body.should.eql({ foo: 'bar' });
  });
});
