
/**
 * Module dependencies
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var callingCodes = require('../countries').callingCodes;

/**
 * Custom country calling code validator (e.g. "351", "1")
 * based on a preset list of valid country calling codes.
 */

module.exports = function() {

  /**
   * Class name
   *
   * @type {String}
   */

  this.__class__ = 'CountryCallingCode';

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

    var isValid = new Assert().Choice(callingCodes).check(value);

    if (true !== isValid) {
      throw new Violation(this, value, { callingCodes: callingCodes });
    }

    return true;
  };

  return this;
};
