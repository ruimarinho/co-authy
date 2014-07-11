
/**
 * Test dependencies
 */

require('should');

var HttpAuthyError = require('../../errors/unauthorized-access-authy-error');
var InvalidTokenAuthyError = require('../../errors/invalid-token-authy-error');

describe('InvalidRequestAuthyError', function() {
  it('should inherit from `HttpAuthyError`', function() {
    var error = new InvalidTokenAuthyError();

    error.should.be.instanceOf(HttpAuthyError);
  });
});
