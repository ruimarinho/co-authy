
/**
 * Module dependencies.
 */

var nock = require('nock');

/**
 * Mock a GET request to retrieve an user status.
 */

var mockGetUserStatus = function mockGetUserStatus(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  /* jshint camelcase: false */
  var responses = {
    success: {
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
    }
  };
  /* jshint camelcase: true */

  var reply = 200 === statusCode ? responses.success : responses.failure;

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/status/).test(path)) {
        return path;
      }

      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');
      path = path.replace(/\/users\/.*\/status/, '/users/{authyId}/status');

      return path;
    })
    .get('/protected/json/users/{authyId}/status?api_key={apiKey}', options.matchBody)
    .reply(statusCode, reply);
};

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockGetUserStatus(200, options);
};
