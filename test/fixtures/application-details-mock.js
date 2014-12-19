
/**
 * Module dependencies.
 */

var nock = require('nock');

/**
 * Mock a GET request to retrieve application details.
 */

function mockGetApplicationDetails(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  /* jshint camelcase: false */
  var responses = {
    success: {
      app: {
        app_id: 3,
        name: 'Sandbox App 2',
        plan: 'starter',
        sms_enabled: false,
        white_label: false
      },
      message: 'Application information.',
      success: true
    }
  };
  /* jshint camelcase: true */

  var response = 200 === statusCode ? responses.success : responses.failure;

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/details/).test(path)) {
        return path;
      }

      return path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
    })
    .get('/protected/json/app/details?api_key={apiKey}')
    .reply(statusCode, response);
}

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockGetApplicationDetails(200, options);
};
