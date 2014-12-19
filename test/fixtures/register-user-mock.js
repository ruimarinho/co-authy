
/**
 * Module dependencies.
 */

var _ = require('lodash');
var nock = require('nock');

/**
 * Mock a POST request to register a user.
 */

var mockRegisterUser = function mockRegisterUser(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  /* jshint camelcase: false */
  var responses = {
    failureApiKeyInvalid: {
      errors: {
        message: 'Invalid API key.'
      },
      message: 'Invalid API key.',
      success: false
    },
    failureRequestInvalid: {
      errors: {
        message: 'User was not valid.',
      },
      message: 'User was not valid.',
      success: false
    },
    success: {
      user: {
        id: 1635
      },
      message: 'User created successfully.',
      success: true
    },
    successAuthyIdMissing: {
      user: {
        authy_id: 1
      }
    }
  };
  /* jshint camelcase: true */

  var errors = {
    'invalid-blank': 'is invalid and can\'t be blank',
    invalid: 'is invalid',
    unsupported: 'is not supported'
  };

  var response;

  switch (options.reason) {
    case 'failure-api-key-invalid':
      response = responses.failureApiKeyInvalid;
      break;

    case 'failure-request-invalid':
      response = responses.failureRequestInvalid;
      break;

    case 'failure-missing-user-id':
      response = responses.successAuthyIdMissing;
      break;

    default:
      response = 200 === statusCode ? responses.success : responses.failure;
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
 * Export a request that will `fail` due to an invalid API key.
 */

module.exports.failWithApiKeyInvalid = function(options) {
  return mockRegisterUser(401, _.defaults({ reason: 'failure-api-key-invalid' }, options));
};

/**
 * Export a request that will `fail` due to validation errors on the remote
 * end.
 */

module.exports.failWithRequestInvalid = function(options) {
  return mockRegisterUser(400, _.defaults({ reason: 'failure-request-invalid' }, options));
};

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRegisterUser(200, options);
};

/**
 * Export a request that will `succeed` but the response will not include a
 * user id as expected.
 */

module.exports.succeedWithMissingUserId = function(options) {
  return mockRegisterUser(200, _.defaults({ reason: 'failure-missing-user-id' }, options));
};
