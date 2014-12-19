
/**
 * Module dependencies.
 */

var _ = require('lodash');
var nock = require('nock');

/**
 * Mock a GET request to verify a token.
 */

var mockVerifyToken = function mockVerifyToken(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    failure: {
      errors: {
        message: 'Token is invalid.'
      },
      message: 'Token is invalid.',
      success: false,
      token: 'is invalid'
    },
    failureRecentlyUsed: {
      errors: {
        message: 'Token is invalid. Token was used recently.'
      },
      message: 'Token is invalid. Token was used recently.',
      success: false,
    },
    success: {
      message: 'Token is valid.',
      success: true,
      token: 'is valid'
    }
  };

  var response;

  switch (options.reason) {
    case 'failure-recently-used':
      response = responses.failureRecentlyUsed;
      break;

    default:
      response = 200 === statusCode ? responses.success : responses.failure;
  }

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/verify\//).test(path)) {
        return path;
      }

      if (options.force && !(/force=true/.test(path))) {
        throw new Error('`force=true` missing from path');
      }

      path = path.replace(/\/verify\/(.*)\//, '/verify/{token}/');
      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
      path = path.replace(/\{token\}\/.*\?api_key/, '{token}/{authyId}?api_key');
      path = path.replace(/&force=[^&]*/g, '');

      return path;
    })
    .get('/protected/json/verify/{token}/{authyId}?api_key={apiKey}')
    .reply(statusCode, response);
};

/**
 * Export a request that will `fail`.
 */

module.exports.fail = function(options) {
  return mockVerifyToken(401, options);
};

/**
 * Export a request that will `fail` with a warning about the token being
 * recently used.
 */

module.exports.failWithRecentlyUsed = function(options) {
  return mockVerifyToken(401, _.defaults({ reason: 'failure-recently-used' }, options));
};

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockVerifyToken(200, options);
};

/**
 * Export a request that will `succeed` with the `force` parameter set to
 * `true`.
 */

module.exports.succeedWithForce = function(options) {
  return mockVerifyToken(200, _.defaults({ force: true }, options));
};
