
/**
 * Module dependencies.
 */

var AuthyUnauthorizedAccessError = require('./authy-unauthorized-access-error');
var util = require('util');

/**
 * `AuthyInvalidTokenError`.
 */

function AuthyInvalidTokenError(body) {
  AuthyUnauthorizedAccessError.call(this, body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyUnauthorizedAccessError`.
 */

util.inherits(AuthyInvalidTokenError, AuthyUnauthorizedAccessError);

/**
 * Export `AuthyInvalidTokenError`.
 */

module.exports = AuthyInvalidTokenError;
