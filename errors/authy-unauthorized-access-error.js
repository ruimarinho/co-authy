
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * Unauthorized access error
 *
 * Might be due to incorrect URL endpoint, invalid token supplied
 * and incorrect or invalid API key.
 */

function AuthyUnauthorizedAccessError(body) {
  AuthyHttpError.call(this, 'Unauthorized access', body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(AuthyUnauthorizedAccessError, AuthyHttpError);

/**
 * Export constructor
 */

module.exports = AuthyUnauthorizedAccessError;
