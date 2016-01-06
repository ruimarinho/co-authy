
/**
 * Module dependencies.
 */

var nock = require('nock');

var mockVerifyToken = function mockVerifyToken(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  var replies = {
    success: {
      success: true,
      token: 'is valid',
      message: 'Token is valid.'
    },
    failure: {
      message: 'Token is invalid.',
      token: 'is invalid',
      success: false,
      errors: {
        message: 'Token is invalid.'
      }
    },
    failureRecentlyUsed: {
      message: 'Token is invalid. Token was used recently.',
      success: false,
      errors: {
        message: 'Token is invalid. Token was used recently.'
      }
    }
  };

  var reply;
  switch (options.reason) {
    case 'recently-used':
      reply = replies.failureRecentlyUsed;
      break;

    default:
      reply = 200 === statusCode ? replies.success : replies.failure;
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
      path = path.replace(/&action=[^&]*/g, '');
      path = path.replace(/&force=[^&]*/g, '');

      return path;
    })
    .get('/protected/json/verify/{token}/{authyId}?api_key={apiKey}')
    .reply(statusCode, reply);
};

/**
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockVerifyToken(200, options);
};

/**
 * Expose a request that will `succeed` with the `action` parameter set.
 */

module.exports.succeedWithAction = function(action) {
  return mockVerifyToken(200, { action: action });
};

/**
 * Expose a request that will `succeed` with the `force` parameter set to `true`.
 */

module.exports.succeedWithForce = function() {
  return mockVerifyToken(200, { force: true });
};

/**
 * Expose a request that will `fail`.
 */

module.exports.fail = function(options) {
  return mockVerifyToken(401, options);
};

/**
 * Expose a request that will `fail` with a warning about the token being
 * recently used.
 */

module.exports.failWithRecentlyUsed = function() {
  return mockVerifyToken(401, { reason: 'recently-used' });
};
