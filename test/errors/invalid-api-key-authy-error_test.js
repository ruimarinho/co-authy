
/**
 * Test dependencies
 */

require('should');

var InvalidApiKeyAuthyError = require('../../errors/invalid-token-authy-error');
var UnauthorizedAccessAuthyError = require('../../errors/unauthorized-access-authy-error');

describe('InvalidApiKeyAuthyError', function() {
  it('should inherit from `UnauthorizedAccessAuthyError`', function() {
    var error = new InvalidApiKeyAuthyError();

    error.should.be.instanceOf(UnauthorizedAccessAuthyError);
  });
});
