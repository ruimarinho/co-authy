
/**
 * Module dependencies.
 */

var HttpAuthyError = require('../errors/http-authy-error');
var InvalidApiKeyAuthyError = require('../errors/invalid-api-key-authy-error');
var InvalidRequestAuthyError = require('../errors/invalid-request-authy-error');
var InvalidTokenAuthyError = require('../errors/invalid-token-authy-error');
var InvalidTokenUsedRecentlyAuthyError = require('../errors/invalid-token-used-recently-authy-error');
var ServiceUnavailableAuthyError = require('../errors/service-unavailable-authy-error');
var UnauthorizedAccessAuthyError = require('../errors/unauthorized-access-authy-error');
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
    throw new ServiceUnavailableAuthyError(body);
  }

  if (401 === statusCode) {
    if (body.message && /token was used recently/i.test(body.message)) {
      throw new InvalidTokenUsedRecentlyAuthyError(body);
    }

    if (body.message && /token is invalid/i.test(body.message)) {
      throw new InvalidTokenAuthyError(body);
    }

    if (body.message && /invalid api key/i.test(body.message)) {
      throw new InvalidApiKeyAuthyError(body);
    }

    throw new UnauthorizedAccessAuthyError(body);
  }

  if (400 === statusCode) {
    throw new InvalidRequestAuthyError(body);
  }

  // Fallback error just in case the HTTP error is a 200
  // but the response was not successful
  if (false === body.success) {
    throw new HttpAuthyError('Invalid HTTP request', body);
  }

  return body;
};
