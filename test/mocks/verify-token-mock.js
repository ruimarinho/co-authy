
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a GET request to verify a token.
 */

function mock({ body, statusCode }, options = {}) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(path => {
      return path.replace(/key=.*?(&|$)/, 'key={key}$1')
        .replace(/verify\/.*?\//, 'verify/{token}/')
        .replace(/\/[0-9].*\?/, '/{authyId}?')
    })
    .get(`/protected/json/verify/{token}/{authyId}?api_key={key}${options.force ? '&force=true' : ''}`)
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed(options) {
  return mock({
    body: {
      message: 'Token is valid.',
      success: true,
      token: 'is valid'
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
 * Export a request that will `fail`.
 */

export function fail() {
  return mock({
    body: {
      errors: {
        message: 'Token is invalid.'
      },
      message: 'Token is invalid.',
      success: false,
      token: 'is invalid'
    },
    statusCode: 401
  });
};

/**
 * Export a request that will `fail` with a warning about the token being used recently.
 */

export function failWithRecentlyUsed() {
  return mock({
    body: {
      errors: {
        message: 'Token is invalid. Token was used recently.'
      },
      message: 'Token is invalid. Token was used recently.',
      success: false,
    },
    statusCode: 401
  });
};
