
/**
 * Module dependencies.
 */

var _ = require('lodash');
var nock = require('nock');

/**
 * Mock a POST request to register a user.
 */

var mockRegisterUser = function mockRegisterUser(statusCode, options) {
  /* jshint camelcase:false*/
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    succeed: {
      user: {
        id: 1635
      }
    },
    succeedWithInvalidAuthyId: {
      user: {
        authy_id: 1
      }
    },
    fail: {},
    failWithInvalidApiKey: {
      message: 'Invalid API key.',
      success: false,
      errors: {
        message: 'Invalid API key.'
      }
    },
    failWithInvalidRequest: {
      message: 'User was not valid.',
      success: false,
      errors: {
        message: 'User was not valid.',
      }
    }
  };

  var errors = {
    unsupported: 'is not supported',
    invalid: 'is invalid',
    'invalid-blank': 'is invalid and can\'t be blank',
  };

  var response;
  switch (options.reason) {
    case 'missing-user-id':
      response = responses.succeedWithInvalidAuthyId;
      break;

    case 'invalid-request':
      response = responses.failWithInvalidRequest;
      break;

    case 'invalid-api-key':
      response = responses.failWithInvalidApiKey;
      break;

    default:
      response = 200 === statusCode ? responses.succeed : responses.fail;
  }

  if (options.errors) {
    _.forEach(options.errors, function(reason, key) {
      response[key] = errors[reason];
      response.errors[key] = errors[reason];
    });
  }

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/new/).test(path)) {
        return path;
      }

      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');

      return path;
    })
    .post('/protected/json/users/new?api_key={apiKey}', options.matchBody)
    .reply(statusCode, response);
};

/**
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRegisterUser(200, options);
};

/**
 * Expose a request that will `succeed` but the response will not include a
 * user id as expected.
 */

module.exports.succeedWithMissingUserId = function(options) {
  return mockRegisterUser(200, { reason: 'missing-user-id' }, options);
};

/**
 * Expose a request that will `fail` due to validation errors on the remote end.
 */

module.exports.failWithInvalidRequest = function(errors) {
  return mockRegisterUser(400, { reason: 'invalid-request', errors: errors });
};

/**
 * Expose a request that will `fail` due to an invalid API key.
 */

module.exports.failWithInvalidApiKey = function(options) {
  return mockRegisterUser(401, { reason: 'invalid-api-key' }, options);
};
