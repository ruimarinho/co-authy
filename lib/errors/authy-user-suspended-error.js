
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * `AuthyUserSuspendedError`.
 */

function AuthyUserSuspendedError(body) {
  AuthyHttpError.call(this, 'User suspended', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyHttpError`.
 */

util.inherits(AuthyUserSuspendedError, AuthyHttpError);

/**
 * Export `AuthyUserSuspendedError`.
 */

module.exports = AuthyUserSuspendedError;
