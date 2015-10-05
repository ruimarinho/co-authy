
/**
 * Module dependencies.
 */

var AuthyError = require('../../lib/errors/authy-error');
var AuthyHttpError = require('../../lib/errors/authy-http-error');

/**
 * Test `AuthyHttpError`.
 */

describe('AuthyHttpError', function() {
  it('should inherit from `AuthyError`', function() {
    var error = new AuthyHttpError();

    error.should.be.instanceOf(AuthyError);
  });

  it('should have a default message', function() {
    var error = new AuthyHttpError();

    error.message.should.equal('Http error');
  });

  it('should accept a `message`', function() {
    var error = new AuthyHttpError('foo');

    error.message.should.equal('foo');
  });

  it('should accept a `body`', function() {
    var error = new AuthyHttpError('foo', { foo: 'bar' });

    error.body.should.eql({ foo: 'bar' });
  });

  it('should use a message from `body.message` if available', function() {
    var error = new AuthyHttpError('foo', { message: 'bar' });

    error.message.should.equal('bar');
  });

  it('should expose errors from `body.errors` if available', function() {
    var error = new AuthyHttpError('foo', { errors: { qux: 'bar' }});

    error.errors.should.eql({ qux: 'bar' });
  });
});
