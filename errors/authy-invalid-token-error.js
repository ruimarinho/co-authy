
/**
 * Module dependencies.
 */

var AuthyUnauthorizedAccessError = require('./authy-unauthorized-access-error');
var util = require('util');

/**
 * Invalid token error.
 */

function AuthyInvalidTokenError(body) {
  AuthyUnauthorizedAccessError.call(this, body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype.
 */

util.inherits(AuthyInvalidTokenError, AuthyUnauthorizedAccessError);

/**
 * Export constructor.
 */

module.exports = AuthyInvalidTokenError;
