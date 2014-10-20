
/**
 * Module dependencies.
 */

var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Custom country calling code validator (e.g. "351", "1")
 * based on a preset list of valid country calling codes.
 */

module.exports = function() {

  /**
   * Class name.
   *
   * @type {String}
   */

  this.__class__ = 'CountryCallingCode';

  /**
   * Validation algorithm.
   *
   * @param  {mixed} value
   * @throws {Violation}
   * @return {true}
   */

  this.validate = function(value) {
    /* jshint camelcase:false*/
    if ('string' !== typeof value && 'number' !== typeof value) {
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_number });
    }

    var isValid = PhoneNumberUtil.UNKNOWN_REGION_ !== phoneUtil.getRegionCodeForCountryCode(value);

    if (true !== isValid) {
      throw new Violation(this, value);
    }

    return true;
  };

  return this;
};
