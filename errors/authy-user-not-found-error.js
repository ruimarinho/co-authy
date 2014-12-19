
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * User suspended error.
 */

function AuthyUserNotFoundError(body) {
  AuthyHttpError.call(this, 'User not found', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyHttpError`.
 */

util.inherits(AuthyUserNotFoundError, AuthyHttpError);

/**
 * Export `AuthyUserNotFoundError`.
 */

module.exports = AuthyUserNotFoundError;
