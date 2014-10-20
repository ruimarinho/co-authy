
/**
 * Module dependencies.
 */

var AuthyHttpError = require('./authy-http-error');
var util = require('util');

/**
 * Invalid request error
 */

function AuthyInvalidRequestError(body) {
  AuthyHttpError.call(this, 'Invalid request', body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(AuthyInvalidRequestError, AuthyHttpError);

/**
 * Export constructor
 */

module.exports = AuthyInvalidRequestError;
