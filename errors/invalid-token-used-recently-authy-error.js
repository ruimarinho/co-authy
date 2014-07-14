
/**
 * Module dependencies.
 */

var InvalidTokenAuthyError = require('./invalid-token-authy-error');
var util = require('util');

/**
 * Token used recently error
 */

function InvalidTokenUsedRecentlyAuthyError(body) {
  InvalidTokenAuthyError.call(this, body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(InvalidTokenUsedRecentlyAuthyError, InvalidTokenAuthyError);

/**
 * Export constructor
 */

module.exports = InvalidTokenUsedRecentlyAuthyError;
