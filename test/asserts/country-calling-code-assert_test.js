
/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/asserts/country-calling-code-assert');
var should = require('should');

/**
 * Test `CountryCallingCodeAssert`.
 */

describe('CountryCallingCodeAssert', function() {
  before(function() {
    Assert.prototype.CountryCallingCode = assert;
  });

  it('should throw an error if the country calling code is not a string or a number', function() {
    [[], {}].forEach(function(choice) {
      try {
        new Assert().CountryCallingCode().validate(choice);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        /* jshint camelcase: false */
        e.violation.value.should.equal(Validator.errorCode.must_be_a_string_or_number);
        /* jshint camelcase: true */
      }
    });
  });

  it('should throw an error if the country calling code is invalid', function() {
    ['80', '999'].forEach(function(code) {
      try {
        new Assert().CountryCallingCode().validate(code);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.show().assert.should.equal('CountryCallingCode');
      }
    });
  });

  it('should accept a valid country calling code', function() {
    ['1', '351'].forEach(function(code) {
      try {
        new Assert().CountryCallingCode().validate(code);
      } catch (e) {
        console.error(e);
        console.error(e.stack);

        throw e;
      }
    });
  });
});
