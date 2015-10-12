
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a GET request to retrieve an user status.
 */

function mock({ body, statusCode }) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(path => path.replace(/=[^&].+/, '={key}').replace(/\/[0-9].*\//, '/{authyId}/'))
    .post('/protected/json/users/{authyId}/status?api_key={key}')
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed() {
  return mock({
    body: {
      success: true,
      message: 'User status.',
      status: {
        authy_id: 1635,
        confirmed: true,
        country_code: 351,
        devices: ['iphone', 'ipad'],
        phone_number: 'XX-XXX-4567',
        registered: false
      }
    },
    statusCode: 200
  });
}
