
/**
 * Test dependencies
 */

require('should');

var Assert = require('validator.js').Assert;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/validators/totp-token-validator');

/**
 * TOTP Token Validator tests
 */

describe('TOTP Token Validator', function() {
  before(function() {
    Assert.prototype.TotpToken = assert;
  });

  it('should have default boundaries between 6 and 8 digits', function() {
    var assert = new Assert().TotpToken();

    assert.boundaries.min.should.equal(6);
    assert.boundaries.max.should.equal(8);
  });

  it('throw an error if the input value is an `array`', function() {
    try {
      new Assert().TotpToken().validate([]);
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string');
    }
  });

  it('throw an error if the input value is an `object`', function() {
    try {
      new Assert().TotpToken().validate({});
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string');
    }
  });

  it('throw an error if the input value is a `number`', function() {
    try {
      new Assert().TotpToken().validate(12345678);
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string');
    }
  });

  it('throw an error if the input value is not numeric', function() {
    var input = ['-10', '1.101', '1e6', new Array(50).join('foo')];
    var calls = 0;

    input.forEach(function(value) {
      try {
        new Assert().TotpToken().validate(value);
      } catch (e) {
        calls++;
        e.should.be.instanceOf(Violation);
        e.violation.value.should.equal('must_be_numeric');
      }
    });

    calls.should.equal(input.length);
  });

  it('throw an error if the input value length is below minimum boundary', function() {
    try {
      new Assert().TotpToken().validate('10');
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.min.should.equal(6);
    }
  });

  it('throw an error if the input value length is above maximum boundary', function() {
    var input = ['1001001001', '000000009', '0000000010'];
    var calls = 0;

    input.forEach(function(value) {
      try {
        new Assert().TotpToken().validate(value);
      } catch (e) {
        calls++;
        e.should.be.instanceOf(Violation);
        e.violation.max.should.equal(8);
      }
    });

    calls.should.equal(input.length);
  });
});

it('should accept tokens between 6 and 8 digits', function() {
  var input = ['123456', '0601338', '5166240', '12345678'];

  input.forEach(function(value) {
    new Assert().TotpToken().validate(value);
  });
});
