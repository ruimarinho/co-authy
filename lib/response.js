
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../errors/authy-http-error');
var AuthyInvalidApiKeyError = require('../errors/authy-invalid-api-key-error');
var AuthyInvalidRequestError = require('../errors/authy-invalid-request-error');
var AuthyInvalidTokenError = require('../errors/authy-invalid-token-error');
var AuthyInvalidTokenUsedRecentlyError = require('../errors/authy-invalid-token-used-recently-error');
var AuthyServiceUnavailableError = require('../errors/authy-service-unavailable-error');
var AuthyUnauthorizedAccessError = require('../errors/authy-unauthorized-access-error');
var debug = require('debug')('authy:response');

/**
 * Parse response from Authy API
 */

module.exports = function parse(response) {
  var body = response.body || '';
  var statusCode = response.statusCode;

  debug(body);

  try {
    body = JSON.parse(body);
  } catch (e) {
  }

  if (503 === statusCode) {
    throw new AuthyServiceUnavailableError(body);
  }

  if (401 === statusCode) {
    if (body.message && /token was used recently/i.test(body.message)) {
      throw new AuthyInvalidTokenUsedRecentlyError(body);
    }

    if (body.message && /token is invalid/i.test(body.message)) {
      throw new AuthyInvalidTokenError(body);
    }

    if (body.message && /invalid api key/i.test(body.message)) {
      throw new AuthyInvalidApiKeyError(body);
    }

    throw new AuthyUnauthorizedAccessError(body);
  }

  if (400 === statusCode) {
    throw new AuthyInvalidRequestError(body);
  }

  // Fallback error just in case the HTTP error is a 200
  // but the response was not successful
  if (false === body.success) {
    throw new AuthyHttpError('Invalid HTTP request', body);
  }

  return body;
};
