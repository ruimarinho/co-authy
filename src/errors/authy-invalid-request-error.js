
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * `AuthyInvalidRequestError`.
 */

function AuthyInvalidRequestError(body) {
  AuthyHttpError.call(this, 'Invalid request', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyHttpError`.
 */

util.inherits(AuthyInvalidRequestError, AuthyHttpError);

/**
 * Export `AuthyInvalidRequestError`.
 */

module.exports = AuthyInvalidRequestError;
