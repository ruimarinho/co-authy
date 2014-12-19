
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * `AuthySmsNotSentError`.
 */

function AuthySmsNotSentError(body) {
  AuthyHttpError.call(this, 'SMS not sent', body);

  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit from `AuthyHttpError`.
 */

util.inherits(AuthySmsNotSentError, AuthyHttpError);

/**
 * Export `AuthySmsNotSentError`.
 */

module.exports = AuthySmsNotSentError;
