
/**
 * Module dependencies.
 */

require('should');

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/asserts/totp-token-assert');
var should = require('should');

/**
 * Test `TotpTokenAssert`.
 */

describe('TotpTokenAssert', function() {
  before(function() {
    Assert.prototype.TotpToken = assert;
  });

  it('should throw an error if the token is not a string or a number', function() {
    [[], {}].forEach(function(choice) {
      try {
        new Assert().TotpToken().validate(choice);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        /* jshint camelcase: false */
        e.violation.value.should.equal(Validator.errorCode.must_be_a_string_or_number);
        /* jshint camelcase: true */
      }
    });
  });

  it('should throw an error if the token is not numeric', function() {
    ['-10', '1.101', '1e6', new Array(50).join('foo')].forEach(function(value) {
      try {
        new Assert().TotpToken().validate(value);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.value.should.equal(Validator.errorCode.must_be_numeric);
      }
    });
  });

  it('should throw an error if the token length is below the minimum boundary', function() {
    try {
      new Assert().TotpToken().validate('10');

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.min.should.equal(6);
    }
  });

  it('should throw an error if the token length is above the maximum boundary', function() {
    ['1001001001', '000000009', '0000000010'].forEach(function(value) {
      try {
        new Assert().TotpToken().validate(value);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.max.should.equal(8);
      }
    });
  });

  it('should have default boundaries between 6 and 8 digits', function() {
    var assert = new Assert().TotpToken();

    assert.boundaries.min.should.equal(6);
    assert.boundaries.max.should.equal(8);
  });

  it('should accept tokens between 6 and 8 digits', function() {
    ['123456', '0601338', '5166240', '12345678'].forEach(function(value) {
      try {
        new Assert().TotpToken().validate(value);
      } catch (e) {
        console.error(e);
        console.error(e.stack);

        throw e;
      }
    });
  });
});
