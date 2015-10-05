
/**
 * Module dependencies.
 */

'use strict';

import { PhoneNumberUtil } from 'google-libphonenumber';
import { Validator, Violation } from 'validator.js';

/**
 * Export `CountryCallingCodeAssert`.
 *
 * Validate a country calling code (e.g. '351', '1') based on a preset list
 * of valid country calling codes.
 */

export default function () {
  // Class name.
  this.__class__ = 'CountryCallingCode';

  // PhoneNumberUtil instance.
  this.phoneUtil = PhoneNumberUtil.getInstance();

  // Validation algorithm.
  this.validate = value => {
    if ('string' !== typeof value && 'number' !== typeof value) {
      throw new Violation(this, value, { value: 'must_be_a_string_or_number' });
    }

    if (PhoneNumberUtil.UNKNOWN_REGION_ === this.phoneUtil.getRegionCodeForCountryCode(value)) {
      throw new Violation(this, value);
    }

    return true;
  };

  return this;
};
