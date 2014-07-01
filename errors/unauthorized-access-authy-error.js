
/**
 * Module dependencies.
 */

var HttpAuthyError = require('./http-authy-error');
var util = require('util');

/**
 * Unauthorized access error
 *
 * Might be due to incorrect URL endpoint, invalid token supplied
 * and incorrect or invalid API key.
 */

function UnauthorizedAccessAuthyError(body) {
  HttpAuthyError.call(this, 'Unauthorized access', body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(UnauthorizedAccessAuthyError, HttpAuthyError);

/**
 * Export constructor
 */

module.exports = UnauthorizedAccessAuthyError;
