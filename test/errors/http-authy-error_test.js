
/**
 * Module dependencies
 */

var should = require('should');
var sinon = require('sinon');
var HttpAuthyError = require('../../errors/http-authy-error');

describe('HTTP Authy Error', function() {
  it('should accept a `body.errors`', function() {
    var error = new HttpAuthyError('Custom message', { message: 'Special message', errors: { name: 'Special error' }});

    error.message.should.equal('Special message');
    error.errors.should.eql({ name: 'Special error' });
  });

  it('should accept a `body.message`', function() {
    var error = new HttpAuthyError('Custom message', { message: 'Special message' });

    error.message.should.equal('Special message');
    error.body.should.eql({ message: 'Special message' });
  });

  it('should accept an empty `body`', function() {
    var error = new HttpAuthyError('Custom message');

    error.message.should.equal('Custom message');
    error.body.should.eql({});
  });

  it('should default the message to `Http error`', function() {
    var error = new HttpAuthyError(undefined, { errors: {} });

    error.message.should.equal('Http error');
  });
});