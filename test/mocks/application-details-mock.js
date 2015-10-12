
/**
 * Module dependencies.
 */

import nock from 'nock';

/**
 * Mock a GET request to retrieve application details.
 */

function mock({ body, statusCode }) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(/api_key=[^&]*/g, 'api_key={key}')
    .get('/protected/json/app/details?api_key={key}')
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed() {
  return mock({
    body: {
      app: {
        app_id: 3,
        name: 'Sandbox App 2',
        plan: 'starter',
        sms_enabled: false,
        white_label: false
      },
      message: 'Application information.',
      success: true
    },
    statusCode: 200
  });
}
