
/**
 * Module dependencies.
 */

var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Export `CountryCallingCodeAssert`.
 *
 * Validate a country calling code (e.g. '351', '1') based on a preset list
 * of valid country calling codes.
 */

module.exports = function() {
  // Class name.
  this.__class__ = 'CountryCallingCode';

  // Validation algorithm.
  this.validate = function(value) {
    if ('string' !== typeof value && 'number' !== typeof value) {
      /* jshint camelcase: false */
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_number });
      /* jshint camelcase: true */
    }

    var isValid = PhoneNumberUtil.UNKNOWN_REGION_ !== phoneUtil.getRegionCodeForCountryCode(value);

    if (true !== isValid) {
      throw new Violation(this, value);
    }

    return true;
  };

  return this;
};
