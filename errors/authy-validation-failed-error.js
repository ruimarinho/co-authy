
/**
 * Module dependencies.
 */

var AuthyError = require('./authy-error');
var util = require('util');

/**
 * Validation failed error.
 */

function AuthyValidationFailedError(errors) {
  AuthyError.call(this, 'Validation failed', { errors: errors });

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype.
 */

util.inherits(AuthyValidationFailedError, AuthyError);

/**
 * Export `AuthyValidationFailedError`.
 */

module.exports = AuthyValidationFailedError;
