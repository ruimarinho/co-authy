
/**
 * Module dependencies.
 */

var AuthyHttpError = require('../errors/authy-http-error');
var AuthyInvalidApiKeyError = require('../errors/authy-invalid-api-key-error');
var AuthyInvalidRequestError = require('../errors/authy-invalid-request-error');
var AuthyInvalidTokenError = require('../errors/authy-invalid-token-error');
var AuthyInvalidTokenUsedRecentlyError = require('../errors/authy-invalid-token-used-recently-error');
var AuthyServiceUnavailableError = require('../errors/authy-service-unavailable-error');
var AuthySmsNotSentError = require('../errors/authy-sms-not-sent-error');
var AuthyUnauthorizedAccessError = require('../errors/authy-unauthorized-access-error');
var AuthyUserNotFoundError = require('../errors/authy-user-not-found-error');
var AuthyUserSuspendedError = require('../errors/authy-user-suspended-error');
var format = require('util').format;
// var logging = require('../logging/logger');
// var moduleLogger = logging.createLogger('response-parser');
var logger = require('debugnyan')('authy:response-parser');

/**
 * Export `parse` function to parse a response from Authy API.
 */

module.exports = {
  parse: function parse(response, options) {
    options = options || {};

    var body = response[1];
    var statusCode = response[0].statusCode;

    logger.debug({ response: response }, 'Parsing response');

    try {
      body = JSON.parse(body);
    } catch (e) {
      logger.error({ body: body, error: e }, 'Unable to parse response body as JSON');
    }

    if (503 === statusCode) {
      if (body.message && /user has been suspended/i.test(body.message)) {
        throw new AuthyUserSuspendedError(body);
      }

      if (body.message && /SMS token was not sent/i.test(body.message)) {
        throw new AuthySmsNotSentError(body);
      }

      throw new AuthyServiceUnavailableError(body);
    }

    if (404 === statusCode) {
      throw new AuthyUserNotFoundError(body);
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

    if (200 !== statusCode) {
      throw new AuthyHttpError(format('Unexpected status code %s', statusCode), body);
    }

    // Fallback error just in case the HTTP error is a 200
    // but the response was not successful.
    if (!body || !body.success) {
      throw new AuthyHttpError('Invalid HTTP request', body);
    }

    logger.debug({ body: body }, 'Parsed response');

    return body;
  }
};
