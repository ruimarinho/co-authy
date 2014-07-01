
/**
 * Module dependencies.
 */

var AuthyError = require('./authy-error');
var util = require('util');


/**
 * Invalid request error
 */

function HttpAuthyError(message, body) {
  var attributes = {
    body: body
  };

  message = message || 'Http error';

  if (body.message) {
    message = body.message;
  }

  if (body.errors) {
    attributes.errors = body.errors;
  }

  AuthyError.call(this, message, attributes);
  Error.captureStackTrace(this, this.constructor);
}

/**
 * Inherit prototype
 */

util.inherits(HttpAuthyError, AuthyError);

/**
 * Export constructor
 */

module.exports = HttpAuthyError;
