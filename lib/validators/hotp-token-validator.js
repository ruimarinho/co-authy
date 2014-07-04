
/**
 * Module dependencies
 */

var _ = require('lodash');
var Violation = require('validator.js').Violation;

/**
 * Custom phone number validator based on `libphonenumber`.
 *
 * Based on RFC4226 ("Implementations MUST extract a 6-digit
 * code at a minimum and possibly 7 and 8-digit code").
 *
 * @see https://tools.ietf.org/html/rfc4226
 */

module.exports = function() {

  /**
   * Class name
   *
   * @type {String}
   */

  this.__class__ = 'HotpToken';

  /**
   * Token Boundaries
   *
   * @type {Object}
   */

  this.boundaries = {
    min: 6,
    max: 8
  };

  /**
   * Validation algorithm
   *
   * @param  {mixed} value
   * @throws {Violation}
   * @return {true}
   */

  this.validate = function(value) {
    var type = typeof value;

    if ('number' !== type && 'string' !== type) {
      throw new Violation(this, value, { value: 'must_be_a_string_or_number' });
    }

    if (!/^(?:(?:0|[1-9][0-9]*))$/.test(value)) {
      throw new Violation(this, value, { value: 'must_be_an_unsigned_integer' });
    }

    // Generic way of calculating length
    var length = ('' + value).length;

    // Reliable way to calculate length for integers
    if ('number' === type) {
      length = (value === 0) ? 1 : parseInt(Math.log(value) / Math.log(10), 10) + 1;
    }

    if (isNaN(length)) {
      throw new Violation(this, value, { max: this.boundaries.max });
    }

    if (this.boundaries.min === this.boundaries.max && length !== this.boundaries.min) {
      throw new Violation(this, value, { min: this.boundaries.min, max: this.boundaries.max, length: length });
    }

    if (length > this.boundaries.max) {
      throw new Violation(this, value, { max: this.boundaries.max, length: length });
    }

    if (length < this.boundaries.min) {
      throw new Violation(this, value, { min: this.boundaries.min, length: length });
    }

    return true;
  };

  return this;
};
