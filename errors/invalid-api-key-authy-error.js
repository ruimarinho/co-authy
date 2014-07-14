
/**
 * Module dependencies.
 */

var UnauthorizedAccessAuthyError = require('./unauthorized-access-authy-error');
var util = require('util');

/**
 * Invalid API key error
 *
 */

function InvalidApiKeyAuthyError(body) {
  UnauthorizedAccessAuthyError.call(this, body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(InvalidApiKeyAuthyError, UnauthorizedAccessAuthyError);

/**
 * Export constructor
 */

module.exports = InvalidApiKeyAuthyError;
