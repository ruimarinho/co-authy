
/**
 * Module dependencies.
 */

var AuthyError = require('./authy-error');
var util = require('util');

/**
 * Client-side validation failed error.
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
 * Export constructor.
 */

module.exports = AuthyValidationFailedError;
