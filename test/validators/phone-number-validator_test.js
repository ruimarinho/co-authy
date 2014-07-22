
/**
 * Test dependencies
 */


var Assert = require('validator.js').Assert;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/validators/phone-number-validator');
var should = require('should');

/**
 * Phone Number Validator tests
 */

describe('Phone Number Validator', function() {
  before(function() {
    Assert.prototype.PhoneNumber = assert;
  });

  it('should throw an error if a country calling code to match for is missing', function() {
    try {
      new Assert().PhoneNumber();

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(Error);
      e.message.should.equal('You must specify a country calling code');
    }
  });

  it('should throw an error if the input value is an `array`', function() {
    try {
      new Assert().PhoneNumber('PT').validate([]);

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string');
    }
  });

  it('should throw an error if the input value is an `object`', function() {
    try {
      new Assert().PhoneNumber('PT').validate({});

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string');
    }
  });

  it('should throw an error if the input value is a `number`', function() {
    try {
      new Assert().PhoneNumber('PT').validate(12345678);

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(Violation);
      e.violation.value.should.equal('must_be_a_string');
    }
  });

  it('should throw an error if the input is invalid', function() {
    var calls = 0;
    var numbers = [
      ['MX', '+3511234567'],
      ['IT', '541-754-3010'],
      ['GB', '(809) 234 5678'],
    ];

    numbers.forEach(function(pairs) {
      try {
        new Assert().PhoneNumber(pairs[0]).validate(pairs[1]);

        should.fail(pairs[1]);
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.reason.should.match(/is not valid/);
        calls++;
      }
    });

    numbers.length.should.equal(calls);
  });

  it('should throw an error if the input is invalid for the country of origin', function() {
    var calls = 0;
    var numbers = [
      ['PT', '+5215555123123'], // "MX" is expected
      ['ES', '00 39 312 123 1234'], // "IT" is expected
      ['ES', '+39 0187 1234(12)'], // "IT" is expected
      ['CH', '00 1 809 555 5555'], // "US" is expected
      ['PT', '+1 809 555 5555'], // "DO" is expected
      ['GB', '07624123456'], // "IM" is expected
      ['1', '+351 912 345 679'], // "PT" is expected
      ['41', '+1 408-550-3542'], // "US" is expected
    ];

    numbers.forEach(function(pairs) {
      try {
        new Assert().PhoneNumber(pairs[0]).validate(pairs[1]);

        should.fail(pairs[1]);
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.reason.should.match(/is valid but not for country code/);
        calls++;
      }
    });

    numbers.length.should.equal(calls);
  });

  it('should accept an input value that is valid for the country of origin', function() {
    [
      ['882', '13300655'],
      ['883', '510001341234'],
      ['MX', '+5215555123123'],
      ['PT', '+351923456789'],
      ['PT', '963456789'],
      ['US', '1-541-754-3010'],
      ['IT', '00 39 312 123 1234'],
      ['IT', '+39 0187 1234(12)'],
      ['DO', '(809) 234 5678'],
      ['DO', '1 809 555 5555'],
      ['351', '+351 912 345 679'],
      ['1', '829 590 5555'],
      ['1809', '+1 809 234 5678'],
      ['1809', '+1 809 234 5678'],
    ].forEach(function(pairs) {
      try {
        new Assert().PhoneNumber(pairs[0]).validate(pairs[1]);
      } catch (e) {
        console.error(e);
        console.error(e.stack);

        throw e;
      }
    });
  });
});
