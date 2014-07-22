
/**
 * Module dependencies
 */

var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var _ = require('lodash');
var countries = require('../countries');
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
  var countryCallingCode;

  // Attempt to get country by testing if `code` is an ISO 3166-1 alpha-2 or
  // alpha-3 code, or a numeric calling code
  var country = countries.cca2[code] || countries.cca3[code] || phoneUtil.getRegionCodesForCountryCode(code);

  if (!_.size(country)) {
    return {
      cellphone: cellphone,
      countryCode: code,
      countryCallingCode: code
    };
  }

  // If `code` is numeric, it might have been assigned to multiple countries,
  // such as +44, which is used in "GB", "GG", "IM" and "JE". Unfortunately,
  // in this case, it won't give us much insight about validation rules
  if (_.isArray(country)) {
    country = country.length > 1 ? undefined : _.first(country);
  }

  countryCode = (country && country.cca2) || country || code;

  // The first country calling code in the country list is the most popular
  // one. The remaining ones are generally for historical purposes
  countryCallingCode = country && _.first(country.callingCode) || code;

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
