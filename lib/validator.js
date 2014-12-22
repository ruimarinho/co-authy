
/**
 * Module dependencies.
 */

require('validator.js-asserts');

var Assert = require('validator.js').Assert;
var AuthyValidationFailedError = require('./errors/authy-validation-failed-error');
var Validator = require('validator.js').Validator;
var debug = require('debug')('authy:validator');
var util = require('util');
var validator = new Validator();

/**
 * Add custom error code for `string` or `number`.
 */

/* jshint camelcase: false */
Validator.errorCode.must_be_a_string_or_number = 'must_be_a_string_or_number';
/* jshint camelcase: true */

/**
 * Add custom error code for `numeric`.
 */

/* jshint camelcase: false */
Validator.errorCode.must_be_numeric = 'must_be_numeric';
/* jshint camelcase: true */

/**
 * Add custom `Activity` assert.
 */

Assert.prototype.Activity = require('./asserts/activity-assert');

/**
 * Add custom `CountryCallingCode` assert.
 */

Assert.prototype.CountryCallingCode = require('./asserts/country-calling-code-assert');

/**
 * Add custom `PhoneNumber` assert.
 */

Assert.prototype.PhoneNumber = require('./asserts/phone-number-assert');

/**
 * Add custom `TotpToken` assert.
 */

Assert.prototype.TotpToken = require('./asserts/totp-token-assert');

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
