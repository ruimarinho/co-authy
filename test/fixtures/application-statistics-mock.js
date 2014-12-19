
/**
 * Module dependencies.
 */

var nock = require('nock');

/**
 * Mock a GET request to retrieve application statistics.
 */

function mockGetApplicationStatistics(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  /* jshint camelcase: false */
  var responses = {
    success: {
      app_id: 3,
      count: 12,
      message: 'Monthly statistics.',
      total_users: 115,
      stats: [
        {
          api_calls_count: 13,
          auths_count: 0,
          calls_count: 0,
          month: 'August',
          sms_count: 0,
          users_count: 1,
          year: 2013
        }, {
          api_calls_count: 30,
          auths_count: 0,
          calls_count: 0,
          month: 'September',
          sms_count: 0,
          users_count: 1,
          year: 2013
        }, {
          api_calls_count: 20,
          auths_count: 0,
          calls_count: 0,
          month: 'October',
          sms_count: 0,
          users_count: 2,
          year: 2013
        }, {
          api_calls_count: 50,
          auths_count: 0,
          calls_count: 0,
          month: 'November',
          sms_count: 0,
          users_count: 3,
          year: 2013
        }, {
          api_calls_count: 50,
          auths_count: 0,
          calls_count: 0,
          month: 'December',
          sms_count: 0,
          users_count: 7,
          year: 2013
        }, {
          api_calls_count: 8,
          auths_count: 0,
          calls_count: 0,
          month: 'January',
          sms_count: 0,
          users_count: 2,
          year: 2014
        }, {
          api_calls_count: 4,
          auths_count: 0,
          calls_count: 0,
          month: 'February',
          sms_count: 0,
          users_count: 3,
          year: 2014
        }, {
          api_calls_count: 208,
          auths_count: 0,
          calls_count: 0,
          month: 'March',
          sms_count: 0,
          users_count: 27,
          year: 2014
        }, {
          api_calls_count: 162,
          auths_count: 0,
          calls_count: 0,
          month: 'April',
          sms_count: 0,
          users_count: 17,
          year: 2014
        }, {
          api_calls_count: 891,
          auths_count: 0,
          calls_count: 0,
          month: 'May',
          sms_count: 0,
          users_count: 21,
          year: 2014
        }, {
          api_calls_count: 2076,
          auths_count: 0,
          calls_count: 0,
          month: 'June',
          sms_count: 0,
          users_count: 15,
          year: 2014
        }, {
          api_calls_count: 130,
          auths_count: 0,
          calls_count: 0,
          month: 'July',
          sms_count: 0,
          users_count: 1,
          year: 2014
        }
      ],
      success: true
    }
  };
  /* jshint camelcase: true */

  var response = 200 === statusCode ? responses.success : responses.failure;

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
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockGetApplicationStatistics(200, options);
};
