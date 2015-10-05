
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * `AuthyUnauthorizedAccessError`.
 *
 * Might be due to:
 *
 *   - Incorrect URL endpoint.
 *   - Invalid token supplied.
 *   - Incorrect or invalid API key.
 */

function AuthyUnauthorizedAccessError(body) {
  AuthyHttpError.call(this, 'Unauthorized access', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyHttpError`.
 */

util.inherits(AuthyUnauthorizedAccessError, AuthyHttpError);

/**
 * Export `AuthyUnauthorizedAccessError`.
 */

module.exports = AuthyUnauthorizedAccessError;
