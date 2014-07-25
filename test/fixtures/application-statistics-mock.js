
/**
 * Module dependencies
 */

var nock = require('nock');

/**
 * Mock a GET request to retrieve application statistics.
 */

function mockGetApplicationStatistics(statusCode, options) {
  /* jshint camelcase:false*/
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    succeed: {
      message: 'Monthly statistics.',
      count: 12,
      total_users: 115,
      app_id: 3,
      success: true,
      stats: [
        {
          sms_count: 0,
          calls_count: 0,
          users_count: 1,
          auths_count: 0,
          month: 'August',
          api_calls_count: 13,
          year: 2013
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 1,
          auths_count: 0,
          month: 'September',
          api_calls_count: 30,
          year: 2013
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 2,
          auths_count: 0,
          month: 'October',
          api_calls_count: 20,
          year: 2013
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 3,
          auths_count: 0,
          month: 'November',
          api_calls_count: 50,
          year: 2013
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 7,
          auths_count: 0,
          month: 'December',
          api_calls_count: 50,
          year: 2013
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 2,
          auths_count: 0,
          month: 'January',
          api_calls_count: 8,
          year: 2014
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 3,
          auths_count: 0,
          month: 'February',
          api_calls_count: 4,
          year: 2014
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 27,
          auths_count: 0,
          month: 'March',
          api_calls_count: 208,
          year: 2014
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 17,
          auths_count: 0,
          month: 'April',
          api_calls_count: 162,
          year: 2014
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 21,
          auths_count: 0,
          month: 'May',
          api_calls_count: 891,
          year: 2014
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 15,
          auths_count: 0,
          month: 'June',
          api_calls_count: 2076,
          year: 2014
        }, {
          sms_count: 0,
          calls_count: 0,
          users_count: 1,
          auths_count: 0,
          month: 'July',
          api_calls_count: 130,
          year: 2014
        }
      ]
    },
    fail: {}
  };

  var response = 200 === statusCode ? responses.succeed : responses.fail;

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/stats/).test(path)) {
        return path;
      }

      return path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
    })
    .get('/protected/json/app/stats?api_key={apiKey}')
    .reply(statusCode, response);
}

/**
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function() {
  return mockGetApplicationStatistics(200);
};
