
/**
 * Module dependencies.
 */

var AuthyUnauthorizedAccessError = require('./authy-unauthorized-access-error');
var util = require('util');

/**
 * `AuthyInvalidApiKeyError`.
 */

function AuthyInvalidApiKeyError(body) {
  AuthyUnauthorizedAccessError.call(this, body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyUnauthorizedAccessError`.
 */

util.inherits(AuthyInvalidApiKeyError, AuthyUnauthorizedAccessError);

/**
 * Export `AuthyInvalidApiKeyError`.
 */

module.exports = AuthyInvalidApiKeyError;
