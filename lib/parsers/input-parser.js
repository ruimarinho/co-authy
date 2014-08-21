
/**
 * Module dependencies
 */

var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var _ = require('lodash');
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Expose function that parses raw cellphone and code input.
 *
 * @param  {String} cellphone
 * @param  {String} code
 * @return {Object}
 */

module.exports.parseRawInput = function(cellphone, code) {
  code = code || 'US';

  var countryCode;

  // Attempt to get the country calling code (e.g. `+351`) from a country
  // code (e.g. `PT`)
  var countryCallingCode = phoneUtil.getCountryCodeForRegion(code);

  // Unless the return value is `0`, a valid country calling code was found,
  // which in turn means that `code` was a valid country code
  if (countryCallingCode) {
    countryCode = code;
  }

  if (!countryCode) {
    // `countryCode` is not yet defined, so `code` is either an invalid country
    //  code or a country calling code (maybe valid or not at this point)
    countryCode = phoneUtil.getRegionCodesForCountryCode(code);
  }

  if (!_.size(countryCode)) {
    // No country codes available for the country calling code given, so return
    // whatever we can from the original parse request in the expected format
    return {
      cellphone: cellphone,
      countryCode: code,
      countryCallingCode: code
    };
  }

  if (_.isArray(countryCode)) {
    // `code` is a country calling code and may have been assigned to multiple
    // countries (e.g. `44`, which is used in "GB", "GG", "IM" and "JE"). If
    // this is observed, ignore the returned list of possible country codes to
    // avoid applying incorrect phone validation rules.
    countryCode = 1 === countryCode.length ? _.first(countryCode) : code;
    countryCallingCode = code;
  }

  // Non-geographical entities, such as country calling codes +882 or +883
  // serve as a catch-all for services not dedicated to a single country, like
  // satellite telephone carriers, VoIP and others. In this case we need to
  // append the country calling code to the cellphone number, as the country
  // code used in non-geographical entities is not valid
  if (PhoneNumberUtil.REGION_CODE_FOR_NON_GEO_ENTITY === countryCode) {
    cellphone = PhoneNumberUtil.PLUS_SIGN + code + cellphone;
  }

  return {
    cellphone: cellphone,
    countryCode: countryCode,
    countryCallingCode: countryCallingCode
  };
};
