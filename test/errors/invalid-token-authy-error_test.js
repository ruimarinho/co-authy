
/**
 * Module dependencies
 */

var should = require('should');
var sinon = require('sinon');
var InvalidRequestAuthyError = require('../../errors/invalid-request-authy-error');
var InvalidTokenAuthyError = require('../../errors/invalid-token-authy-error');

describe('Invalid Token Authy Error', function() {
  it('should inherit from `InvalidRequestAuthyError`', function() {
    var error = new InvalidTokenAuthyError();

    error.should.be.instanceOf(InvalidRequestAuthyError);
  });
});