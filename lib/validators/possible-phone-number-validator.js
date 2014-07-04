/**
 * Global flags
 */

global.COMPILED = false;

/**
 * Module dependencies
 */

var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var closureBasePath = require('path').join(__dirname, '../../node_modules/libphonenumber/lib/closure/goog/');
var goog = require('closure').Closure({ CLOSURE_BASE_PATH: closureBasePath });
var fmt = require('util').format;

/**
 * Require modules
 */

goog.require('goog.array');
goog.require('goog.proto2.PbLiteSerializer');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.json');

/**
 * Load scripts
 */

goog.loadScript(closureBasePath + 'i18n/phonenumbers/phonemetadata.pb.js');
goog.loadScript(closureBasePath + 'i18n/phonenumbers/phonenumber.pb.js');
goog.loadScript(closureBasePath + 'i18n/phonenumbers/metadata.js');
goog.loadScript(closureBasePath + 'i18n/phonenumbers/phonenumberutil.js');

/**
 * PhoneUtil instance
 *
 * @type {PhoneUtil}
 */

var phoneUtil = goog.global.i18n.phonenumbers.PhoneNumberUtil.getInstance();

/**
 * Custom phone number validator based on `libphonenumber`
 */

module.exports = function(countryCallingCode) {

  /**
   * Class name
   *
   * @type {String}
   */

  this.__class__ = 'PossiblePhoneNumber';

  if ('undefined' === typeof countryCallingCode) {
    throw new Error('You must specify a country calling code');
  }

  /**
   * Country code
   *
   * @type {String}
   */

  this.countryCallingCode = countryCallingCode;

  /**
   * Validation algorithm
   *
   * @param  {mixed} value
   * @throws {Violation}
   * @return {true}
   */

  this.validate = function(value) {
    if ('string' !== typeof value) {
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
    }

    try {
      var phoneNumber = phoneUtil.parse(fmt('+%s%s', this.countryCallingCode, value));

      if (true !== phoneUtil.isPossibleNumber(phoneNumber)) {
        throw new Error('Possibly not a valid phone number');
      }
    } catch (e) {
      throw new Violation(this, value, { reason: e && e.message || e });
    }

    return true;
  };

  return this;
};
