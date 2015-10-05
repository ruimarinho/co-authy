
/**
 * Module dependencies.
 */

var AuthyError = require('../../lib/errors/authy-error');

/**
 * Test `AuthyError`.
 */

describe('AuthyError', function() {
  it('should inherit from `Error`', function() {
    var error = new AuthyError();

    error.should.be.instanceOf(Error);
  });

  it('should expose constructor name', function() {
    var error = new AuthyError();

    error.name.should.equal('AuthyError');
  });

  it('should accept a `message`', function() {
    var error = new AuthyError('foo');

    error.message.should.equal('foo');
  });

  it('should accept `attributes`', function() {
    var error = new AuthyError('foo', { bar: 'qux' });

    error.bar.should.equal('qux');
  });
});
