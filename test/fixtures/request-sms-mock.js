
/**
 * Module dependencies.
 */

var _ = require('lodash');
var nock = require('nock');

/**
 * Mock a GET request to request an SMS.
 */

var mockRequestSms = function mockRequestSms(statusCode, options) {
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
    success: {
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS token was sent',
      success: true
    },
    successMissingCellphone: {
      message: 'An error ocurred while sending the SMS',
      success: true
    },
    successSmsIgnored: {
      cellphone: '+351-XXX-XXX-XX67',
      device: 'iphone',
      ignored: true,
      message: 'Ignored: SMS is not needed for smartphones. Pass force=true if you want to actually send it anyway.',
      success: true
    }
  };
  /* jshint camelcase: true */

  var response;

  switch (options.reason) {
    case 'failure-authy-id-not-found':
      response = responses.failureAuthyIdNotFound;
      break;

    case 'success-cellphone-missing':
      response = responses.successMissingCellphone;
      break;

    case 'success-sms-ignored':
      response = responses.successSmsIgnored;
      break;

    default:
      response = 200 === statusCode ? responses.success : responses.failure;
  }

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/sms\//).test(path)) {
        return path;
      }

      if (options.force && !(/force=true/.test(path))) {
        throw new Error('`force=true` missing from path');
      }

      if (options.shortcode && !(/shortcode=true/.test(path))) {
        throw new Error('`shortcode=true` missing from path');
      }

      path = path.replace(/\/sms\/.*\?api_key/, '/sms/{authyId}?api_key');
      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
      path = path.replace(/&force=[^&]*/g, '');
      path = path.replace(/&shortcode=[^&]*/g, '');

      return path;
    })
    .get('/protected/json/sms/{authyId}?api_key={apiKey}', options.matchBody)
    .reply(statusCode, response);
};

/**
 * Export a request that will `fail` due to an non-existing authy id.
 */

module.exports.failWithAuthyIdNotFound = function(options) {
  return mockRequestSms(404, _.defaults({ reason: 'failure-authy-id-not-found' }, options));
};

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRequestSms(200, options);
};

/**
 * Export a request that will `succeed` with the `force` parameter set to
 * `true`.
 */

module.exports.succeedWithForce = function(options) {
  return mockRequestSms(200, _.defaults({ force: true }, options));
};

/**
 * Export a request that will `succeed` with the `shortcode` parameter set to
 * `true`.
 */

module.exports.succeedWithShortcode = function(options) {
  return mockRequestSms(200, _.defaults({ shortcode: true }, options));
};

/**
 * Export a request that will `succeed` but with an unexpected response due
 * to the cellphone being missing.
 */

module.exports.succeedWithCellphoneMissing = function(options) {
  return mockRequestSms(200, _.defaults({ reason: 'success-cellphone-missing' }, options));
};

/**
 * Export a request that will `succeed` with a warning about the request to
 * send an SMS to the user being ignored.
 */

module.exports.succeedWithSmsIgnored = function(options) {
  return mockRequestSms(200, _.defaults({ reason: 'success-sms-ignored' }, options));
};
