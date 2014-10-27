
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * User suspended error.
 */

function AuthyUserSuspendedError(body) {
  AuthyHttpError.call(this, 'User suspended', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype.
 */

util.inherits(AuthyUserSuspendedError, AuthyHttpError);

/**
 * Export `AuthyUserSuspendedError`.
 */

module.exports = AuthyUserSuspendedError;
