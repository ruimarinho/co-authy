
/**
 * Module dependencies.
 */

var AuthyUnauthorizedAccessError = require('./authy-unauthorized-access-error');
var util = require('util');

/**
 * Invalid API key error.
 */

function AuthyInvalidApiKeyError(body) {
  AuthyUnauthorizedAccessError.call(this, body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype.
 */

util.inherits(AuthyInvalidApiKeyError, AuthyUnauthorizedAccessError);

/**
 * Export constructor.
 */

module.exports = AuthyInvalidApiKeyError;
