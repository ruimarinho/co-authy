
/**
 * Module dependencies.
 */

var AuthyError = require('./authy-error');
var util = require('util');

/**
 * `AuthyValidationFailedError`.
 */

function AuthyValidationFailedError(errors) {
  AuthyError.call(this, 'Validation failed', { errors: errors });

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyError`.
 */

util.inherits(AuthyValidationFailedError, AuthyError);

/**
 * Export `AuthyValidationFailedError`.
 */

module.exports = AuthyValidationFailedError;
