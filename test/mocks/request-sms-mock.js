
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a GET request to request an SMS.
 */

function mock({ body, statusCode }, options = {}) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(path => path.replace(/key=.*?(&|$)/, 'key={key}$1').replace(/\/[0-9].*\?/, '/{authyId}?'))
    .post(`/protected/json/sms/{authyId}?api_key={key}${options.force ? '&force=true' : ''}${options.shortcode ? '&shortcode=true' : ''}`)
    .reply(statusCode, body);
}

/**
 * Export a request that will `fail` with `User not found`.
 */

export function failureUserNotFound() {
  return mock({
    body: {
      errors: {
        message: 'User not found.'
      },
      message: 'User not found.',
      success: false
    },
    statusCode: 404
  })
}

/**
 * Export a request that will `succeed`.
 */

export function succeed(options) {
  return mock({
    body: {
      cellphone: '+351-XXX-XXX-XX67',
      message: 'SMS token was sent',
      success: true
    },
    statusCode: 200
  }, options);
};

/**
 * Export a request that will `succeed` with `force=true`.
 */

export function succeedWithForce() {
  return succeed({ force: true });
};

/**
 * Export a request that will `succeed` with `shortcode=true`.
 */

export function succeedWithShortcode() {
  return succeed({ shortcode: true });
};

/**
 * Export a request that will `succeed` with a missing `cellphone` property.
 */

export function succeedWithMissingCellphone() {
  return mock({
    body: {
      message: 'An error ocurred while sending the SMS',
      success: true
    },
    statusCode: 200
  })
}

/**
 * Export a request that will `succeed` with `force=true`.
 */

export function succeedWithSmsIgnored() {
  return mock({
    body: {
      cellphone: '+351-XXX-XXX-XX67',
      device: 'iphone',
      ignored: true,
      message: 'Ignored: SMS is not needed for smartphones. Pass force=true if you want to actually send it anyway.',
      success: true
    },
    statusCode: 200
  });
};
