
/**
 * Module dependencies.
 */

/* jshint esnext:true */
var request = require('co-request');
var util = require('util');
var isJson = require('is-json');

module.exports = AuthyClient;

function AuthyClient(apiKey, apiUrl) {
  this.apiKey = apiKey;
  this.apiUrl = apiUrl || 'https://api.authy.com';
}

AuthyClient.prototype.registerUser = function *(email, cellphone, countryCode) {
  countryCode = countryCode || 'USA';

  var response = yield request.post(util.format('%s%s', this.apiUrl, '/protected/json/users/new'), {
    form: {
      'user[email]': email,
      'user[cellphone]': cellphone,
      'user[country_code]': countryCode
    },
    qs: {
      api_key: this.apiKey
    }
  });

  if (isJson(response.body)) {
    return JSON.parse(response.body);
  }

  return response.body;
};

AuthyClient.prototype.verifyToken = function *(authyId, token, force) {
  var response = yield request.get(util.format('%s%s%s', this.apiUrl, '/protected/json/verify/', token, authyId), {
    qs: {
      api_key: this.apiKey,
      force: force
    }
  });

  if (isJson(response.body)) {
    return JSON.parse(response.body);
  }

  return response.body;
};

AuthyClient.prototype.requestSms = function *(authyId, force) {
  var response = yield request.get(util.format('%s%s%s', this.apiUrl, '/protected/json/sms/', authyId), {
    qs: {
      api_key: this.apiKey,
      force: force
    }
  });

  if (isJson(response.body)) {
    return JSON.parse(response.body);
  }

  return response.body;
};

AuthyClient.prototype.requestCall = function *(authyId, force) {
  var response = yield request.get(util.format('%s%s%s', this.apiUrl, '/protected/json/call/', authyId), {
    qs: {
      api_key: this.apiKey,
      force: force
    }
  });

  if (isJson(response.body)) {
    return JSON.parse(response.body);
  }

  return response.body;
};

AuthyClient.prototype.deleteUser = function *(authyId) {
  var response = yield request.post(util.format('%s%s%s', this.apiUrl, '/protected/json/users/delete', authyId), {
    qs: {
      api_key: this.apiKey
    }
  });

  if (isJson(response.body)) {
    return JSON.parse(response.body);
  }

  return response.body;
};