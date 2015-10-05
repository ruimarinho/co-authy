
/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/asserts/phone-number-assert');
var should = require('should');

/**
 * Test `PhoneNumberAssert`.
 */

describe('PhoneNumberAssert', function() {
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

  it('should throw an error if the phone number is not a string', function() {
    [[], {}, 123].forEach(function(choice) {
      try {
        new Assert().PhoneNumber('PT').validate(choice);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        /* jshint camelcase: false */
        e.violation.value.should.equal(Validator.errorCode.must_be_a_string);
        /* jshint camelcase: true */
      }
    });
  });

  it('should throw an error if the phone number is invalid', function() {
    [
      ['MX', '+3511234567'],
      ['IT', '541-754-3010'],
      ['GB', '(809) 234 5678'],
    ].forEach(function(pairs) {
      try {
        new Assert().PhoneNumber(pairs[0]).validate(pairs[1]);

        should.fail(pairs[1]);
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.reason.should.match(/is not valid/);
      }
    });
  });

  it('should throw an error if the input is invalid for the country of origin', function() {
    [
      ['AU', '0011 1 408-550-3542'], // "US" was expected
      ['PT', '+5215555123123'], // "MX" was expected
      ['ES', '00 39 312 123 1234'], // "IT" was expected
      ['ES', '+39 0187 1234(12)'], // "IT" was expected
      ['CH', '00 1 809 555 5555'], // "US" was expected
      ['PT', '+1 809 555 5555'], // "DO" was expected
      ['GB', '07624123456'], // "IM" was expected
      ['1', '+351 912 345 679'], // "PT" was expected
      ['41', '+1 408-550-3542'], // "US" was expected
      ['61', '0011 1 408-550-3542'], // "US" was expected
    ].forEach(function(pairs) {
      try {
        new Assert().PhoneNumber(pairs[0]).validate(pairs[1]);

        should.fail(pairs[1]);
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.violation.reason.should.match(/is valid but not for country code/);
      }
    });
  });

  it('should accept an phone number that is valid for the country of origin', function() {
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
      ['1', '011 1 408-550-3542'],
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
