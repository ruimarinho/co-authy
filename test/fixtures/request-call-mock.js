
/**
 * Module dependencies.
 */

var nock = require('nock');

var mockRequestCall = function mockRequestCall(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    success: {
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS token was sent'
    },
    successCallIgnored: {
      message: 'Ignored: Call is not needed for smartphones. Pass force=true if you want to actually call anyway.',
      cellphone: '+351-XXX-XXX-XX67',
      device: 'iphone',
      ignored: true,
      success: true
    },
    failure: {},
    failureMissingCellphone: {
      success: true,
      message: 'An error ocurred while calling the cellphone'
    },
    failureInvalidAuthyId: {
      message: 'User not found.',
      success: false,
      errors: {
        message: 'User not found.'
      }
    }
  };

  var response;
  switch (options.reason) {
    case 'missing-cellphone':
      response = responses.failureMissingCellphone;
      break;

    case 'invalid-authy-id':
      response = responses.failureInvalidAuthyId;
      break;

    case 'ignore-call':
      response = responses.successCallIgnored;
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
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRequestCall(200, options);
};

/**
 * Expose a request that will `succeed` with the force parameter set to
 * `true`.
 */

module.exports.succeedWithForce = function() {
  return mockRequestCall(200, { force: true });
};

/**
 * Expose a request that will `succeed` with a warning about the request to
 * call the user being ignored.
 */

module.exports.succeedWithIgnoredCall = function(options) {
  return mockRequestCall(200, { reason: 'ignore-call' }, options);
};

/**
 * Expose a request that will `succeed` but with an unexpected response due
 * to the cellphone being missing.
 */

module.exports.succeedWithMissingCellphone = function(options) {
  return mockRequestCall(200, { reason: 'missing-cellphone' }, options);
};

/**
 * Expose a request that will `fail` due to an non-existing authy ID.
 */

module.exports.failWithInvalidAuthyId = function(options) {
  return mockRequestCall(404, { reason: 'invalid-authy-id' }, options);
};

