
/**
 * Module dependencies
 */

var nock = require('nock');

/**
 * Mock a POST request to register a user activity.
 */

function mockRegisterActivity(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    succeed: {
      message: 'Activity was created.',
      success: true
    },
    fail: {}
  };

  var response = 200 === statusCode ? responses.succeed : responses.fail;

  nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
      path = path.replace(/\/users\/.*\/register_activity/, '/users/{authyId}/register_activity');

      return path;
    })
    .post('/protected/json/users/{authyId}/register_activity?api_key={apiKey}', options.matchBody)
    .reply(statusCode, response);
}

/**
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockRegisterActivity(200, options);
};
