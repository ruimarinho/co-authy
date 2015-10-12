
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a POST request to delete a user.
 */

function mock({ body, statusCode }) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(path => path.replace(/=[^&].+/, '={key}').replace(/\/[0-9].*\?/, '/{authyId}?'))
    .post('/protected/json/users/delete/{authyId}?api_key={key}')
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed() {
  return mock({
    body: {
      success: {
        message: 'User was added to remove.',
        success: true
      }
    },
    statusCode: 200
  });
}
