
/**
 * Module dependencies.
 */

var _ = require('lodash');
var util = require('util');

/**
 * `AuthyError`.
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
 * Inherit from `Error`.
 */

util.inherits(AuthyError, Error);

/**
 * Export `AuthyError`.
 */

module.exports = AuthyError;

