
/**
 * Module dependencies.
 */

var AuthyError = require('./authy-error');
var util = require('util');

/**
 * `AuthyHttpError`.
 */

function AuthyHttpError(message, body) {
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
 * Inherit from `AuthyError`.
 */

util.inherits(AuthyHttpError, AuthyError);

/**
 * Export `AuthyHttpError`.
 */

module.exports = AuthyHttpError;
