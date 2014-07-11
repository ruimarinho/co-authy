
/**
 * Test dependencies
 */

require('should');

var InvalidTokenAuthyError = require('../../errors/invalid-token-authy-error');
var UnauthorizedAccessAuthyError = require('../../errors/unauthorized-access-authy-error');

describe('InvalidTokenAuthyError', function() {
  it('should inherit from `UnauthorizedAccessAuthyError`', function() {
    var error = new InvalidTokenAuthyError();

    error.should.be.instanceOf(UnauthorizedAccessAuthyError);
  });
});
