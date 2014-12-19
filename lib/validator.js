/* jshint camelcase:false*/

/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var AuthyValidationFailedError = require('../errors/authy-validation-failed-error');
var Validator = require('validator.js').Validator;
var debug = require('debug')('authy:validator');
var util = require('util');
var validator = new Validator();

/**
 * Add custom error code for string or number.
 */

Validator.errorCode.must_be_a_string_or_number = 'must_be_a_string_or_number';

/**
 * Add custom TOTP token validator.
 */

Assert.prototype.TotpToken = require('./validators/totp-token-validator');

/**
 * Add custom phone number validator.
 */

Assert.prototype.PhoneNumber = require('./validators/phone-number-validator');

/**
 * Add custom country calling code validator.
 */

Assert.prototype.CountryCallingCode = require('./validators/country-calling-code-validator');

/**
 * Validate data using constraints.
 */

module.exports.validate = function validate(data, constraints) {
  var errors = validator.validate(data, constraints);

  if (true !== errors) {
    debug(util.inspect(errors, { depth: 10 }));

    throw new AuthyValidationFailedError(errors);
  }
};

/**
 * Export `Assert`.
 */

module.exports.Assert = Assert;
