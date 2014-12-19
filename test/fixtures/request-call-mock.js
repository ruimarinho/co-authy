
/**
 * Module dependencies.
 */

var _ = require('lodash');
var nock = require('nock');

/**
 * Mock a GET request to request a call.
 */

var mockRequestCall = function mockRequestCall(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  /* jshint camelcase: false */
  var responses = {
    failureAuthyIdNotFound: {
      errors: {
        message: 'User not found.'
      },
      message: 'User not found.',
      success: false,
    },
    failureUserSuspended: {
      errors: {
        message: 'User has been suspended.'
      },
      message: 'User has been suspended.',
      success: false
    },
    success: {
      cellphone: '+351-XXX-XXX-XX67',
      message: 'Call started...',
      success: true,
    },
    successCallIgnored: {
      cellphone: '+351-XXX-XXX-XX67',
      device: 'iphone',
      ignored: true,
      message: 'Call ignored. User is using  App Tokens and this call is not necessary. Pass force=true if you still want to call users that are using the App.',
      success: true
    },
    successMissingCellphone: {
      message: 'An error ocurred while calling the cellphone',
      success: true
    }
  };
  /* jshint camelcase: true */

  var response;

  switch (options.reason) {
    case 'failure-authy-id-not-found':
      response = responses.failureAuthyIdNotFound;
      break;

    case 'failure-user-suspended':
      response = responses.failureUserSuspended;
      break;

    case 'success-call-ignored':
      response = responses.successCallIgnored;
      break;

    case 'success-cellphone-missing':
      response = responses.successMissingCellphone;
      break;

    default:
      response = 200 === statusCode ? responses.success : responses.failure;
  }

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/call\//).test(path)) {
        return path;
      }

      if (options.force && !(/force=true/.test(path))) {
        throw new Error('`force=true` missing from path');
      }

      path = path.replace(/\/call\/.*\?api_key/, '/call/{authyId}?api_key');
      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
      path = path.replace(/&force=[^&]*/g, '');

      return path;
    })
    .get('/protected/json/call/{authyId}?api_key={apiKey}', options.matchBody)
    .reply(statusCode, response);
};

/**
 * Export a request that will `fail` due to an non-existing authy id.
 */

module.exports.failWithAuthyIdNotFound = function(options) {
  return mockRequestCall(404, _.defaults({ reason: 'failure-authy-id-not-found' }, options));
};

/**
 * Export a request that will `fail` due to the user being suspended.
 */

module.exports.failWithUserSuspended = function(options) {
  return mockRequestCall(503, _.defaults({ reason: 'failure-user-suspended' }, options));
};

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRequestCall(200, options);
};

/**
 * Export a request that will `succeed` with the force parameter set to
 * `true`.
 */

module.exports.succeedWithForce = function(options) {
  return mockRequestCall(200, _.defaults({ force: true }, options));
};

/**
 * Export a request that will `succeed` with a warning about the request to
 * call the user being ignored.
 */

module.exports.succeedWithCallIgnored = function(options) {
  return mockRequestCall(200, _.defaults({ reason: 'success-call-ignored' }, options));
};

/**
 * Export a request that will `succeed` but with an unexpected response due
 * to the cellphone being missing.
 */

module.exports.succeedWithCellphoneMissing = function(options) {
  return mockRequestCall(200, _.defaults({ reason: 'success-cellphone-missing' }, options));
};
