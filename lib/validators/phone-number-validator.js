/* globals goog */

/**
 * Module dependencies
 */

var CCS = require('google-libphonenumber').PhoneNumber.CountryCodeSource;
var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var debug = require('debug')('validator:phone-number');
var fmt = require('util').format;
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Custom phone number validator based on `libphonenumber`
 */

module.exports = function(countryCode) {

  /**
   * Class name
   *
   * @type {String}
   */

  this.__class__ = 'PhoneNumber';

  if ('undefined' === typeof countryCode) {
    throw new Error('You must specify a country calling code');
  }

  /**
   * Country code in ISO 3166-1 alpha-2 format.
   *
   * @type {String}
   */

  this.countryCode = countryCode;

  /**
   * Is country code numeric? (e.g. 882 or 883)
   *
   * @type {Boolean}
   */

  this.isCountryCodeNumeric = /^\d+$/.test(this.countryCode);

  /**
   * Validation algorithm
   *
   * @param  {mixed} value
   * @throws {Violation}
   * @return {true}
   */

  this.validate = function(value) {
    /* jshint camelcase:false*/
    if ('string' !== typeof value) {
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
    }

    var countryCode = this.countryCode;
    var countriesWithSameCallingCode = [];

    try {
      if (this.isCountryCodeNumeric) {
        // Country code is numeric, which means it's actualling a calling code (e.g. 351).
        // Attempt to get the main country code assigned to this calling code
        countryCode = phoneUtil.getRegionCodeForCountryCode(this.countryCode);

        // Test how many countries are assigned to this country calling code. If more than one,
        // it means we won't be able to validate if the number is valid for the region, since
        // we can't know for sure which region to validate
        countriesWithSameCallingCode = phoneUtil.getRegionCodesForCountryCode(this.countryCode);

        if (CCS.FROM_NUMBER_WITH_PLUS_SIGN !== phoneUtil.maybeStripInternationalPrefixAndNormalize(new goog.string.StringBuffer(value))) {
          value = PhoneNumberUtil.PLUS_SIGN + this.countryCode + value;
        }
      }

      // Parse number with a default country code as fallback
      var phoneNumber = phoneUtil.parse(value, countryCode);

      if (this.isCountryCodeNumeric && countryCode !== PhoneNumberUtil.UNKNOWN_REGION_ && this.countryCode !== phoneNumber.getCountryCode().toString()) {
        throw new Error(fmt('Phone number "%s" is valid but not for country code "%s" (%s !== %s)',
          value, countryCode, this.countryCode, phoneNumber.getCountryCode().toString()));
      }

      if (true !== phoneUtil.isValidNumber(phoneNumber)) {
        throw new Error(fmt('Phone number "%s" is not valid', value));
      }

      if (this.isCountryCodeNumeric && (countriesWithSameCallingCode.length > 1 || countryCode === PhoneNumberUtil.UNKNOWN_REGION_)) {
        debug('Phone number "%s" is valid but country code validation skipped (%s -> %s)',
          value, this.countryCode, countryCode);

        return true;
      }

      if (!phoneUtil.isValidNumberForRegion(phoneNumber, countryCode)) {
        throw new Error(fmt('Phone number "%s" is valid but not for country code "%s"',
          value, this.countryCode));
      }

      debug('Phone number "%s" is valid for country code %s', value, countryCode);
    } catch (e) {
      if (e.message) debug(e.message);

      throw new Violation(this, value, { reason: e && e.message || e });
    }

    return true;
  };

  return this;
};
