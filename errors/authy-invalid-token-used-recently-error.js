
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
 * Inherit prototype.
 */

util.inherits(AuthyInvalidTokenUsedRecentlyError, AuthyInvalidTokenError);

/**
 * Export constructor.
 */

module.exports = AuthyInvalidTokenUsedRecentlyError;
