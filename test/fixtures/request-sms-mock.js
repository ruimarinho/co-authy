
/**
 * Module dependencies.
 */

var nock = require('nock');

var mockRequestSms = function mockRequestSms(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  var replies = {
    success: {
      success: true,
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS sent.'
    },
    successSmsIgnored: {
      message: 'Ignored: SMS is not needed for smartphones. Pass force=true if you want to actually send it anyway.',
      cellphone: '+351-XXX-XXX-XX67',
      device: 'iphone',
      ignored: true,
      success: true
    },
    failure: {},
    failureMissingCellphone: {
      success: true,
      message: 'An error ocurred while sending the SMS'
    },
    failureInvalidAuthyId: {
      message: 'User not found.',
      success: false,
      errors: {
        message: 'User not found.'
      }
    }
  };

  var reply;
  switch (options.reason) {
    case 'missing-cellphone':
      reply = replies.failureMissingCellphone;
      break;

    case 'invalid-authy-id':
      reply = replies.failureInvalidAuthyId;
      break;

    case 'ignore-sms':
      reply = replies.successSmsIgnored;
      break;

    default:
      reply = 200 === statusCode ? replies.success : replies.failure;
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
      path = path.replace(/&action=[^&]*/g, '');
      path = path.replace(/&force=[^&]*/g, '');
      path = path.replace(/&shortcode=[^&]*/g, '');

      return path;
    })
    .get('/protected/json/sms/{authyId}?api_key={apiKey}', options.matchBody)
    .reply(statusCode, reply);
};

/**
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRequestSms(200, options);
};

/**
 * Expose a request that will `succeed` with the `action` parameter set.
 */

module.exports.succeedWithAction = function(action) {
  return mockRequestSms(200, { action: action });
};

/**
 * Expose a request that will `succeed` with the `force` parameter set to
 * `true`.
 */

module.exports.succeedWithForce = function() {
  return mockRequestSms(200, { force: true });
};

/**
 * Expose a request that will `succeed` with the `shortcode` parameter set to
 * `true`.
 */

module.exports.succeedWithShortcode = function() {
  return mockRequestSms(200, { shortcode: true });
};

/**
 * Expose a request that will `succeed` but with an unexpected response due
 * to the cellphone being missing.
 */

module.exports.succeedWithMissingCellphone = function(options) {
  return mockRequestSms(200, { reason: 'missing-cellphone' }, options);
};

/**
 * Expose a request that will `succeed` with a warning about the request to
 * send an SMS to the user being ignored.
 */

module.exports.succeedWithIgnoredSms = function(options) {
  return mockRequestSms(200, { reason: 'ignore-sms' }, options);
};

/**
 * Expose a request that will `fail` due to an non-existing authy ID.
 */

module.exports.failWithInvalidAuthyId = function(options) {
  return mockRequestSms(404, { reason: 'invalid-authy-id' }, options);
};
