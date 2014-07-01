
/**
 * Module dependencies.
 */

var HttpAuthyError = require('./http-authy-error');
var util = require('util');

/**
 * Service unavailable
 *
 * Can happen due to many reasons, including:
 *
 *  - An internal error occurred on Authy.
 *  - An API call is being made to an endpoint you don't have access too.
 *  - The API usage limit was reached.
 */

function ServiceUnavailableAuthyError(body) {
  HttpAuthyError.call(this, 'Service unavailable', body);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(ServiceUnavailableAuthyError, HttpAuthyError);

/**
 * Export constructor
 */

module.exports = ServiceUnavailableAuthyError;
