
/**
 * Module dependencies
 */

var Assert = require('validator.js').Assert;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/validators/hotp-token-validator');
var should = require('should');

/**
 * HOTP Token Validator tests
 */

describe('HOTP Token Validator', function() {
  before(function() {
    Assert.prototype.HotpToken = assert;
  });

  it('should have default boundaries between 6 and 8 digits', function() {
    var assert = new Assert().HotpToken();

    assert.boundaries.min.should.equal(6);
    assert.boundaries.max.should.equal(8);
  });

  it('throw an error if the input value is an `array`', function() {
    try {
      new Assert().HotpToken().validate([])
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string_or_number');
    }
  });

  it('throw an error if the input value is an `object`', function() {
    try {
      new Assert().HotpToken().validate({})
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string_or_number');
    }
  });

  describe('Number support', function() {
    it('throw an error if the input value is not an unsigned integer', function() {
      var input = [-10, 1.101, 0.001, 1e35, 1e1000];
      var calls = 0;

      input.forEach(function(value) {
        try {
          new Assert().HotpToken().validate(value)
        } catch (e) {
          calls++;
          e.should.be.instanceOf(Violation);
          e.violation.value.should.equal('must_be_an_unsigned_integer');
        }
      });

      calls.should.equal(input.length);
    });

    it('throw an error if the input value length is below minimum boundary', function() {
      var input = [0, 1, 10, 1e4];
      var calls = 0;

      input.forEach(function(value) {
        try {
          new Assert().HotpToken().validate(value);
        } catch (e) {
          calls++;
          e.should.be.instanceOf(Violation);
          e.violation.min.should.equal(6);
        }
      });

      calls.should.equal(input.length);
    });

    it('throw an error if the input value length is above maximum boundary', function() {
      try {
        new Assert().HotpToken().validate(1001001001)
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.max.should.equal(8);
      }
    });
  });

  describe('String support', function() {
    it('throw an error if the input value is not an unsigned integer', function() {
      var input = ['-10', '1.101', '1e6', Array(50).join('foo')];
      var calls = 0;

      input.forEach(function(value) {
        try {
          new Assert().HotpToken().validate(value)
        } catch (e) {
          calls++;
          e.should.be.instanceOf(Violation);
          e.violation.value.should.equal('must_be_an_unsigned_integer');
        }
      });

      calls.should.equal(input.length);
    });

    it('throw an error if the input value length is below minimum boundary', function() {
      try {
        new Assert().HotpToken().validate('10')
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.min.should.equal(6);
      }
    });

    it('throw an error if the input value length is above maximum boundary', function() {
      try {
        new Assert().HotpToken().validate('1001001001')
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.max.should.equal(8);
      }
    });
  });

  it('should accept tokens between 6 and 8 digits', function() {
    var input = ['123456', '12345678', 123456, 12345678];

    input.forEach(function(value) {
      new Assert().HotpToken().validate(value)
    });
  });
});