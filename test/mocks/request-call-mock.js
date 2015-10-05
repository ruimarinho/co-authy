
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a GET request to request a call.
 */

function mock({ body, statusCode }, options = {}) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(path => path.replace(/key=.*?(&|$)/, 'key={key}$1').replace(/\/[0-9].*\?/, '/{authyId}?'))
    .post(`/protected/json/call/{authyId}?api_key={key}${options.force ? '&force=true' : ''}`)
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed(options) {
  return mock({
    body: {
      cellphone: '+351-XXX-XXX-XX67',
      message: 'Call started...',
      success: true,
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
 * Export a request that will `succeed` with `force=true`.
 */

export function succeedWithCallIgnored() {
  return mock({
    body: {
      cellphone: '+351-XXX-XXX-XX67',
      device: 'iphone',
      ignored: true,
      message: 'Call ignored. User is using  App Tokens and this call is not necessary. Pass force=true if you still want to call users that are using the App.',
      success: true
    },
    statusCode: 200
  });
};
