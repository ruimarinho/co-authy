/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;

/**
 * Export `TotpTokenAssert`.
 *
 * Validate a TOTP token based on http://tools.ietf.org/html/rfc6238.
 */

module.exports = function() {
  // Class name.
  this.__class__ = 'TotpToken';

  // Token boundaries.
  this.boundaries = {
    min: 6,
    max: 8
  };

  // Validation algorithm.
  this.validate = function(value) {
    if ('string' !== typeof value && 'number' !== typeof value) {
      /* jshint camelcase: false */
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_number });
      /* jshint camelcase: true */
    }

    if (!/^[0-9]+$/.test(value)) {
      /* jshint camelcase: false */
      throw new Violation(this, value, { value: Validator.errorCode.must_be_numeric });
      /* jshint camelcase: true */
    }

    var violation = new Assert().Length(this.boundaries).check(value);

    if (true !== violation) {
      throw new Violation(this, value, { min: this.boundaries.min, max: this.boundaries.max });
    }

    return true;
  };

  return this;
};
