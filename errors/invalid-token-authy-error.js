
/**
 * Module dependencies.
 */

var InvalidRequestAuthyError = require('./invalid-request-authy-error');
var util = require('util');

/**
 * Invalid request error
 */

function InvalidTokenAuthyError(body) {
  InvalidRequestAuthyError.call(this, body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(InvalidTokenAuthyError, InvalidRequestAuthyError);

/**
 * Export constructor
 */

module.exports = InvalidTokenAuthyError;
