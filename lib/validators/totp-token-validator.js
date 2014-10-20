/* jshint camelcase:false */

/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;

/**
 * Custom phone number validator based on `libphonenumber`.
 *
 * Minimum of 6, maximum 8-digit code.
 *
 * @see http://tools.ietf.org/html/rfc6238
 */

module.exports = function() {

  /**
   * Class name.
   *
   * @type {String}
   */

  this.__class__ = 'TotpToken';

  /**
   * Token Boundaries.
   *
   * @type {Object}
   */

  this.boundaries = {
    min: 6,
    max: 8
  };

  /**
   * Validation algorithm.
   *
   * @param  {mixed} value
   * @throws {Violation}
   * @return {true}
   */

  this.validate = function(value) {
    if ('string' !== typeof value) {
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
    }

    if (!/^[0-9]+$/.test(value)) {
      throw new Violation(this, value, { value: 'must_be_numeric' });
    }

    var violation = new Assert().Length(this.boundaries).check(value);

    if (true !== violation) {
      throw violation;
    }

    return true;
  };

  return this;
};
