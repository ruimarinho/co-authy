
/**
 * Module dependencies.
 */

var HttpError = require('../errors/http-authy-error');
var InvalidRequestAuthyError = require('../errors/invalid-request-authy-error');
var ServiceUnavailableAuthyError = require('../errors/service-unavailable-authy-error');
var UnauthorizedAccessAuthyError = require('../errors/unauthorized-access-authy-error');
var debug = require('debug')('authy:response');

/**
 * Parse response from Authy API
 */

module.exports = function parse(response) {
  var body = response.body;
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
    throw new UnauthorizedAccessAuthyError(body);
  }

  if (400 === statusCode) {
    throw new InvalidRequestAuthyError(body);
  }

  // Fallback error just in case the HTTP error is a 200
  // but the response was not successful
  if (false === body.success) {
    throw new HttpError('Invalid HTTP request', body);
  }

  return body;
};