/* globals goog */

/**
 * Module dependencies.
 */

var CCS = require('google-libphonenumber').PhoneNumber.CountryCodeSource;
var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var debug = require('debug')('validator:phone-number');
var fmt = require('util').format;
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Export `PhoneNumberAssert`.
 *
 * Validate a phone number based on `libphonenumber`.
 */

module.exports = function(countryCode) {
  // Class name.
  this.__class__ = 'PhoneNumber';

  if ('undefined' === typeof countryCode) {
    throw new Error('You must specify a country calling code');
  }

  // Country code in ISO 3166-1 alpha-2 format.
  this.countryCode = countryCode;

  // Test if country code is numeric (e.g. `882` or `883`).
  this.isCountryCodeNumeric = /^\d+$/.test(this.countryCode);

  // Validation algorithm.
  this.validate = function(value) {
    if ('string' !== typeof value) {
      /* jshint camelcase: false */
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
      /* jshint camelcase: true */
    }

    var countryCode = this.countryCode;
    var countriesWithSameCallingCode = [];

    try {
      if (this.isCountryCodeNumeric) {
        // Country code is numeric, which means it's actualling a calling code (e.g. 351).
        // Attempt to get the main country code assigned to this calling code.
        countryCode = phoneUtil.getRegionCodeForCountryCode(this.countryCode);

        // Test how many countries are assigned to this country calling code. If more than one,
        // it means we won't be able to validate if the number is valid for the region, since
        // we can't know for sure which region to validate.
        countriesWithSameCallingCode = phoneUtil.getRegionCodesForCountryCode(this.countryCode);

        // Attempt to get the international dialing prefix for the specific country code.
        var metadata = phoneUtil.getMetadataForRegionOrCallingCode_(this.countryCode, countryCode);

        // Find which IDD is used by this country.
        var internationalPrefix = metadata && metadata.getInternationalPrefix();

        var buffer = new goog.string.StringBuffer(value);
        var countryCodeSource = phoneUtil.maybeStripInternationalPrefixAndNormalize(buffer, internationalPrefix);

        // Test if we need to add the country calling code to the input
        // value in order to enable validation for non-geographical
        // areas too.
        if (countryCode !== PhoneNumberUtil.UNKNOWN_REGION_ && (!internationalPrefix || CCS.FROM_DEFAULT_COUNTRY === countryCodeSource)) {
          value = PhoneNumberUtil.PLUS_SIGN + this.countryCode + value;
        }
      }

      // Parse number with a default country code as fallback.
      var phoneNumber = phoneUtil.parse(value, countryCode);

      if (!phoneUtil.isValidNumber(phoneNumber)) {
        throw new Error(fmt('Phone number %s is not valid', value));
      }

      if (this.isCountryCodeNumeric) {
        if (countryCode !== PhoneNumberUtil.UNKNOWN_REGION_ && this.countryCode !== phoneNumber.getCountryCode().toString()) {
          throw new Error(fmt('Phone number %s is valid but not for country code %s (%s !== %s)',
            value, countryCode, this.countryCode, phoneNumber.getCountryCode().toString()));
        }

        if (countryCode === PhoneNumberUtil.UNKNOWN_REGION_) {
          debug('Phone number %s is valid but country code validation skipped because region is unknown (%s -> %s)',
            value, this.countryCode, countryCode);

          return true;
        }

        if (countriesWithSameCallingCode.length > 1) {
          debug('Phone number %s is valid but country code validation skipped because code %s is assigned to multiple regions %j',
            value, this.countryCode, countriesWithSameCallingCode);

          return true;
        }
      }

      if (!phoneUtil.isValidNumberForRegion(phoneNumber, countryCode)) {
        throw new Error(fmt('Phone number %s is valid but not for country code %s',
          value, this.countryCode));
      }

      debug('Phone number %s is valid for country code %s', value, countryCode);
    } catch (e) {
      if (e.message) {
        debug(e.message);
      }

      throw new Violation(this, value, { reason: e && e.message || e });
    }

    return true;
  };

  return this;
};
