
/**
 * Module dependencies.
 */

import _ from 'lodash';
import nock from 'nock';

/**
 * List of month names.
 */

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Mock a GET request to retrieve application statistics.
 */

function mock({ body, statusCode }) {
  return nock('http://sandbox-api.authy.com')
    .filteringPath(/api_key=[^&]*/g, 'api_key={key}')
    .get('/protected/json/app/stats?api_key={key}')
    .reply(statusCode, body);
}

/**
 * Export a request that will `succeed`.
 */

export function succeed() {
  return mock({
    body: {
      app_id: 1,
      count: 12,
      message: 'Monthly statistics.',
      total_users: 100,
      stats: _.times(12, n => ({
        api_calls_count: _.random(0, 100),
        auths_count: _.random(0, 100),
        calls_count: _.random(0, 100),
        month: months[n],
        sms_count: _.random(0, 100),
        users_count: _.random(0, 100),
        year: 2015
      })),
      success: true
    },
    statusCode: 200
  });
};
