
/**
 * Module dependencies.
 */

var _ = require('lodash');
var util = require('util');

/**
 * Generic Authy error.
 */

function AuthyError(message, attributes) {
  attributes = attributes || {};

  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message;

  _.forOwn(attributes, function(value, key) {
    if (!_.isUndefined(value)) {
      this[key] = value;
    }
  }, this);
}

/**
 * Inherit prototype.
 */

util.inherits(AuthyError, Error);

/**
 * Export `AuthyError`.
 */

module.exports = AuthyError;

