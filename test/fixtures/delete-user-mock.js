
/**
 * Module dependencies.
 */

var nock = require('nock');

/**
 * Mock a POST request to delete a user.
 */

function mockDeleteUser(statusCode, options) {
  statusCode = statusCode || 200;
  options = options || {};

  var responses = {
    success: {
      success: true,
      message: 'User was added to remove.'
    },
    failure: {}
  };

  var response = 200 === statusCode ? responses.success : responses.failure;

  return nock('http://sandbox-api.authy.com')
    .filteringPath(function(path) {
      if (!(/\/delete\//).test(path)) {
        return path;
      }

      path = path.replace(/\/delete\/.*\?api_key/, '/delete/{authyId}?api_key');
      path = path.replace(/api_key=[^&]*/g, 'api_key={apiKey}');

      return path;
    })
    .post('/protected/json/users/delete/{authyId}?api_key={apiKey}', options.matchBody)
    .reply(statusCode, response);
}

/**
 * Export a request that will `succeed`.
 */

module.exports.succeed = function(options) {
  return mockDeleteUser(200, options);
};
