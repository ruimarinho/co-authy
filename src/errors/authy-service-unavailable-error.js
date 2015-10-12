
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * `AuthyServiceUnavailableError`.
 *
 * Can happen due to many reasons, including:
 *
 *  - An internal error occurred on Authy.
 *  - An API call is being made to an endpoint you don't have access too.
 *  - The API usage limit was reached.
 */

function AuthyServiceUnavailableError(body) {
  AuthyHttpError.call(this, 'Service unavailable', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyHttpError`.
 */

util.inherits(AuthyServiceUnavailableError, AuthyHttpError);

/**
 * Export `AuthyServiceUnavailableError`.
 */

module.exports = AuthyServiceUnavailableError;
