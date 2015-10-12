/* globals goog */

/**
 * Module dependencies.
 */

import debug from 'debug';
import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';
import { Validator, Violation } from 'validator.js';

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

  // PhoneNumberUtil instance.
  this.phoneUtil = PhoneNumberUtil.getInstance();

  // Country code in ISO 3166-1 alpha-2 format.
  this.countryCode = countryCode;

  // Test if country code is numeric (e.g. `882` or `883`).
  this.isCountryCodeNumeric = /^\d+$/.test(this.countryCode);

  // Validation algorithm.
  this.validate = value => {
    if ('string' !== typeof value) {
      /* jshint camelcase: false */
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
      /* jshint camelcase: true */
    }

    let countryCode = this.countryCode;
    let countriesWithSameCallingCode = [];

    try {
      if (this.isCountryCodeNumeric) {
        // Country code is numeric, which means it's actualling a calling code (e.g. 351).
        // Attempt to get the main country code assigned to this calling code.
        countryCode = this.phoneUtil.getRegionCodeForCountryCode(this.countryCode);

        // Test how many countries are assigned to this country calling code. If more than one,
        // it means we won't be able to validate if the number is valid for the region, since
        // we can't know for sure which region to validate.
        countriesWithSameCallingCode = this.phoneUtil.getRegionCodesForCountryCode(this.countryCode);

        // Attempt to get the international dialing prefix for the specific country code.
        const metadata = this.phoneUtil.getMetadataForRegionOrCallingCode_(this.countryCode, countryCode);

        // Find which IDD is used by this country.
        const internationalPrefix = metadata && metadata.getInternationalPrefix();

        const buffer = new goog.string.StringBuffer(value);
        const countryCodeSource = this.phoneUtil.maybeStripInternationalPrefixAndNormalize(buffer, internationalPrefix);

        // Test if we need to add the country calling code to the input
        // value in order to enable validation for non-geographical
        // areas too.
        if (countryCode !== PhoneNumberUtil.UNKNOWN_REGION_ && (!internationalPrefix || CCS.FROM_DEFAULT_COUNTRY === countryCodeSource)) {
          value = PhoneNumberUtil.PLUS_SIGN + this.countryCode + value;
        }
      }

      // Parse number with a default country code as fallback.
      const phoneNumber = this.phoneUtil.parse(value, countryCode);

      if (!this.phoneUtil.isValidNumber(phoneNumber)) {
        throw new Error(`Phone number ${value} is not valid`);
      }

      if (this.isCountryCodeNumeric) {
        if (countryCode !== PhoneNumberUtil.UNKNOWN_REGION_ && this.countryCode !== phoneNumber.getCountryCode().toString()) {
          throw new Error(`Phone number ${value} is valid but not for country code ${countryCode} (${this.countryCode} !== ${phoneNumber.getCountryCode().toString()})`);
        }

        if (countryCode === PhoneNumberUtil.UNKNOWN_REGION_) {
          debug(`Phone number ${value} is valid but country code validation skipped because region is unknown (${this.countryCode} -> ${countryCode})`);

          return true;
        }

        if (countriesWithSameCallingCode.length > 1) {
          debug(`Phone number ${value} is valid but country code validation skipped because code ${this.countryCode} is assigned to multiple regions ${JSON.stringify(countriesWithSameCallingCode)}`);

          return true;
        }
      }

      if (!this.phoneUtil.isValidNumberForRegion(phoneNumber, countryCode)) {
        throw new Error(`Phone number ${value} is valid but not for country code ${this.countryCode}`);
      }

      debug(`Phone number ${value} is valid for country code ${countryCode}`);
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
