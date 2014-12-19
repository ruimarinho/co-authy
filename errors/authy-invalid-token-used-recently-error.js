
/**
 * Module dependencies.
 */

var AuthyInvalidTokenError = require('./authy-invalid-token-error');
var util = require('util');

/**
 * Token used recently error.
 */

function AuthyInvalidTokenUsedRecentlyError(body) {
  AuthyInvalidTokenError.call(this, body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyInvalidTokenError`.
 */

util.inherits(AuthyInvalidTokenUsedRecentlyError, AuthyInvalidTokenError);

/**
 * Export `AuthyInvalidTokenUsedRecentlyError`.
 */

module.exports = AuthyInvalidTokenUsedRecentlyError;
