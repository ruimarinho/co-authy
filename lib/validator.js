
/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var ValidationFailedAuthyError = require('../errors/validation-failed-authy-error');
var Validator = require('validator.js').Validator;
var debug = require('debug')('authy:validator');
var validator = new Validator();
var util = require('util');

/**
 * Validate data using constraints
 */

module.exports.validate = function validate(data, constraints) {
  var errors = validator.validate(data, constraints);

  if (true !== errors) {
    debug(util.inspect(errors, { depth: 10 }));

    throw new ValidationFailedAuthyError(errors);
  }
};

/**
 * Export Assert
 */

module.exports.Assert = Assert;