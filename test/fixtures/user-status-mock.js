
/**
 * Module dependencies
 */

var nock = require('nock');

var mockGetUserStatus = function mockGetUserStatus(statusCode, options) {
  /* jshint camelcase:false*/
  statusCode = statusCode || 200;
  options = options || {};

  var replies = {
    success: {
      success: true,
      message: 'User status.',
      status: {
        authy_id: 1635,
        confirmed: true,
        registered: false,
        country_code: 351,
        phone_number: 'XX-XXX-4567',
        devices: []
      }
    },
    failure: {}
  };

  var reply = 200 === statusCode ? replies.success : replies.failure;

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
 * Expose a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockGetUserStatus(200, options);
};
