
/**
 * Test dependencies
 */

require('should');

var InvalidTokenAuthyError = require('../../errors/unauthorized-access-authy-error');
var InvalidTokenUsedRecentlyAuthyError = require('../../errors/invalid-token-used-recently-authy-error');

describe('InvalidTokenUsedRecentlyAuthyError', function() {
  it('should inherit from `InvalidTokenAuthyError`', function() {
    var error = new InvalidTokenUsedRecentlyAuthyError();

    error.should.be.instanceOf(InvalidTokenAuthyError);
  });
});
