
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a POST request to register a user activity.
 */

function mock({ body, statusCode }, options = {}) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(path => path.replace(/=[^&].+/, '={key}').replace(/\/[0-9].*\//, '/{authyId}/'))
    .post('/protected/json/users/{authyId}/register_activity?api_key={key}', options.matchBody)
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed(options) {
  return mock({
    body: {
      message: 'Activity was created.',
      success: true
    },
    statusCode: 200
  }, options);
};
