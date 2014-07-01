
/**
 * Module dependencies.
 */

var HttpAuthyError = require('./http-authy-error');
var util = require('util');

/**
 * Invalid request error
 */

function InvalidRequestAuthyError(body) {
  HttpAuthyError.call(this, 'Invalid request', body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(InvalidRequestAuthyError, HttpAuthyError);

/**
 * Export constructor
 */

module.exports = InvalidRequestAuthyError;
