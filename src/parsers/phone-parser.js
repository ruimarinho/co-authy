
/**
 * Module dependencies.
 */

var _ = require('lodash');
var PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
var PNF = require('google-libphonenumber').PhoneNumberFormat;
// var logging = require('../logging/logger');
// var moduleLogger = logging.createLogger('phone-parser');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

/**
 * Export `parse` function to parse a phone and code input.
 *
 * @param {String} phone
 * @param {String} code
 * @param {Object} options
 * @return {Object}
 */

module.exports.parse = function(phone, code, options) {
  options = options || {};
  code = code || 'US';

  let number = phone;
  let result;
  let countryCode;
  // var logger = logging.getLogger(moduleLogger, options);

  // logger.debug({ phone: phone, code: code }, 'Parsing phone');

  // Attempt to get the country calling code (e.g. `+351`) from a country
  // code (e.g. `PT`).
  var countryCallingCode = phoneUtil.getCountryCodeForRegion(code);

  // Unless the return value is `0`, a valid country calling code was found,
  // which in turn means that `code` was a valid country code.
  if (countryCallingCode) {
    countryCode = code;
  }

  if (!countryCode) {
    // `countryCode` is not yet defined, so `code` is either an invalid country
    //  code or a country calling code (maybe valid or not at this point).
    countryCode = phoneUtil.getRegionCodesForCountryCode(code);
  }

  if (!_.size(countryCode)) {
    result = {
      phone: phone,
      countryCode: code,
      countryCallingCode: code
    };

    // logger.debug(result, 'Parsed phone without matching country code');

    // No country codes available for the country calling code given, so return
    // whatever we can from the original parse request in the expected format.
    return result;
  }

  if (_.isArray(countryCode)) {
    // `code` is a country calling code and may have been assigned to multiple
    // countries (e.g. `44`, which is used in "GB", "GG", "IM" and "JE"). If
    // this is observed, ignore the returned list of possible country codes to
    // avoid applying incorrect phone validation rules.
    // logger.debug({ code: code, countryCode: countryCode }, 'Parsing code as country calling code');

    countryCode = 1 === countryCode.length ? _.first(countryCode) : code;
    countryCallingCode = Number(code);
  }

  // Non-geographical entities, such as country calling codes +882 or +883
  // serve as a catch-all for services not dedicated to a single country, like
  // satellite telephone carriers, VoIP and others. In this case we need to
  // append the country calling code to the phone number, as the country
  // code used in non-geographical entities is not valid.
  if (PhoneNumberUtil.REGION_CODE_FOR_NON_GEO_ENTITY === countryCode) {
    number = PhoneNumberUtil.PLUS_SIGN + code + phone;
  }

  result = { number, countryCode, countryCallingCode };

  // logger.debug(result, 'Parsed phone');

  return result;
};


/**
 * Export `e164` function to convert a phone number to the the E164 format,
 * e.g. +351912345678.
 *
 * @param {String} phone
 * @param {String} code
 * @param {Object} options
 * @return {String}
 */

module.exports.e164 = function e164(phone, code, options) {
  // var logger = logging.getLogger(moduleLogger, options);
  var result = phoneUtil.format(phoneUtil.parse(phone, code), PNF.E164);

  // logger.debug({ phone: phone, code: code, e164: result }, 'Parsed phone as e164');

  return result;
};
