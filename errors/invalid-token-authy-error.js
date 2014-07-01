
/**
 * Module dependencies.
 */

var HttpAuthyError = require('./http-authy-error');
var util = require('util');

/**
 * Invalid request error
 */

function InvalidTokenAuthyError(body) {
  HttpAuthyError.call(this, 'Invalid token', body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(InvalidTokenAuthyError, HttpAuthyError);

/**
 * Export constructor
 */

module.exports = InvalidTokenAuthyError;
