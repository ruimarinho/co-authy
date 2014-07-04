
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
    body: body || {}
  };

  message = message || 'Http error';

  if (attributes.body.message) {
    message = attributes.body.message;
  }

  if (attributes.body.errors) {
    attributes.errors = attributes.body.errors;
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
