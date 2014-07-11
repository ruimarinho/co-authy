
/**
 * Module dependencies.
 */

var UnauthorizedAccessAuthyError = require('./unauthorized-access-authy-error');
var util = require('util');

/**
 * Invalid token error
 */

function InvalidTokenAuthyError(body) {
  UnauthorizedAccessAuthyError.call(this, body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(InvalidTokenAuthyError, UnauthorizedAccessAuthyError);

/**
 * Export constructor
 */

module.exports = InvalidTokenAuthyError;
