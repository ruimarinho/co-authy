
/**
 * Module dependencies
 */

var nock = require('nock');

/**
 * Mock a GET request to retrieve application details.
 */

function mockGetApplicationDetails(statusCode, options) {
  /* jshint camelcase:false*/
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    succeed: {
      message: 'Application information.',
      success: true,
      app: {
        name: 'Sandbox App 2',
        plan: 'starter',
        sms_enabled: false,
        white_label: false,
        app_id: 3
      }
    },
    fail: {}
  };

  var response = 200 === statusCode ? responses.succeed : responses.fail;

  nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      return path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
    })
    .get('/protected/json/app/details?api_key={apiKey}')
    .reply(statusCode, response);
}

/**
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockGetApplicationDetails(200, options);
};
