
/**
 * Module dependencies
 */

var PNF = require('google-libphonenumber').PhoneNumberFormat;
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Expose function to convert a number to the the E164 format, e.g.
 * +351912345678.
 *
 * @param  {String} number
 * @param  {String} code
 * @return {String}
 */

module.exports.e164 = function(number, code) {
  return phoneUtil.format(phoneUtil.parse(number, code), PNF.E164);
};
