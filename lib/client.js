
/**
 * Module dependencies.
 */

var Assert = require('./validator').Assert;
var AuthyError = require('../errors/authy-error');
var InvalidTokenAuthyError = require('../errors/invalid-token-authy-error');
var UnauthorizedAccessAuthyError = require('../errors/unauthorized-access-authy-error');
var _ = require('lodash');
var countries = require('./countries');
var debug = require('debug')('authy:client');
var net = require('net');
var parse = require('./response');
var request = require('co-request');
var sf = require('sf');
var util = require('util');
var validate = require('./validator').validate;

/**
 * Initialize a new Authy Client.
 *
 * @param {String} api_key Required.
 * @param {String} api_url Defaults to production endpoint.
 */

function AuthyClient(api_key, api_url) {
  if (!(this instanceof AuthyClient)) return new AuthyClient(api_key, api_url);

  validate({
    api_key: api_key,
    api_url: api_url,
  }, {
    api_key: [
      new Assert().Required(),
      new Assert().NotBlank()
    ],
    api_url: [
      new Assert().Required(),
      new Assert().NotBlank()
    ]
  });

  this.apiKey = api_key;
  this.apiUrl = api_url || 'https://api.authy.com';

  this.qs = function qs(obj) {
    obj = _.merge({
      api_key: this.apiKey
    }, obj || {});

    return _.omit(obj, function(value) {
      return _.isUndefined(value);
    });
  };

  this.url = function url() {
    var args = _.toArray(arguments);

    return util.format('%s%s', this.apiUrl, sf.apply(this, args));
  };
}

/**
 * Enable two-factor authentication on a user. You should store the returned
 * `authy_id` in your database for subsequent calls.
 *
 * @param {String} email The email to match the user to.
 * @param {String} cellphone You can use dashes, periods or spaces to separate the numbers.
 *                           Country code should be sent separately.
 * @param {String} country_code Can be a calling code (e.g. 351), a ISO 3166-1 alpha-2 code or
 *                              (e.g. PT) or a ISO 3166-1 alpha-3 code (e.g. PTR).
 *                              Defaults to US (1) if omitted.
 * @return {Integer} The `authy_id` of the registered user.
 * @api public
 */

AuthyClient.prototype.registerUser = function *(email, cellphone, country_code) {
  if (country_code) {
    var country = countries.cca2[country_code] || countries.cca3[country_code];

    if (country) {
      country_code = _.first(country.callingCode);
    }
  }

  var data = {
    email: email,
    cellphone: cellphone,
    country_code: country_code && country_code.toString() || '1'
  };

  validate(data, {
    email: [
      new Assert().Required(),
      new Assert().Email()
    ],
    cellphone: [
      new Assert().Required(),
      new Assert().NotBlank()
    ],
    country_code: [
      new Assert().Required(),
      new Assert().Choice(countries.codes)
    ]
  });

  var response = yield request.post(this.url('/protected/json/users/new'), {
    form: {
      user: data
    },
    qs: this.qs()
  });

  response = parse(response);

  if (!response.user || !response.user.id) {
    throw new AuthyError('`user.id` is missing', { body: response });
  }

  return response;
};

/**
 * Verify a token entered by the user. Enable the `force` parameter to verify
 * the token regardless of the user login status.
 *
 * @param {String} authy_id The `authy_id` returned when registering the user.
 * @param {String} token The token entered by the user to verify.
 * @params {Object} options Available options: [`force`]
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.verifyToken = function *(authy_id, token, options) {
  options = options || {};

  validate({
    authy_id: authy_id,
    token: token,
    force: options.force
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    token: [
      new Assert().Required(),
      new Assert().NotBlank()
    ],
    force: [
      new Assert().Callback(function(value) {
        return _.isBoolean(value);
      })
    ]
  });

  var response = yield request.get(this.url('/protected/json/verify/{token}/{authy_id}', { authy_id: authy_id, token: token }), {
    qs: this.qs({
      force: options.force
    })
  });

  try {
    response = parse(response);
  } catch (e) {
    if ((e instanceof UnauthorizedAccessAuthyError) && e.body.token) {
      throw new InvalidTokenAuthyError(e.body);
    }

    throw e;
  }

  return response;
};

/**
 * Request an SMS with a token for users that don't own a smartphone. If the Authy
 * app is in use by the user, this request is ignored. Pass `force` to send an SMS
 * regardless of this. You can also use the `shortcode` option to send the SMS using
 * short code (available in US and Canada).
 *
 * @param {String} authy_id The `authy_id` returned when registering the user.
 * @param {Object} options Available options: ['force', 'shortcode']
 * @return {String} The cellphone number to which the call was made.
 * @api public
 */

AuthyClient.prototype.requestSms = function *(authy_id, options) {
  options = options || {};

  validate({
    authy_id: authy_id,
    force: options.force,
    shortcode: options.shortcode
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    force: [
      new Assert().Callback(function(value) {
        return _.isBoolean(value);
      })
    ],
    shortcode: [
      new Assert().Callback(function(value) {
        return _.isBoolean(value);
      })
    ]
  });

  var response = yield request.get(this.url('/protected/json/sms/{authy_id}', { authy_id: authy_id }), {
    qs: this.qs({
      force: options.force,
      shortcode: options.shortcode
    })
  });

  response = parse(response);

  if (!response.cellphone) {
    throw new AuthyError('`cellphone` is missing', { body: response });
  }

  return response;
};

/**
 * Request a call with a token for users that don't own a smartphone or are having
 * trouble with SMS. If the Authy app is in use by the user, this request is ignored.
 * Pass `force` to call the user regardless of this.
 *
 * @param {String} authy_id The `authy_id` returned when registering the user.
 * @param {Object} options Available options: ['force']
 * @return {String} The cellphone number to which the call was made.
 * @api public
 */

AuthyClient.prototype.requestCall = function *(authy_id, options) {
  options = options || {};

  validate({
    authy_id: authy_id,
    force: options.force,
    shortcode: options.shortcode
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    force: [
      new Assert().Callback(function(value) {
        return _.isBoolean(value);
      })
    ]
  });

  var response = yield request.get(this.url('/protected/json/call/{authy_id}', { authy_id: authy_id }), {
    qs: this.qs({
      force: options.force
    })
  });

  response = parse(response);

  if (!response.cellphone) {
    throw new AuthyError('`cellphone` is missing', { body: response });
  }

  return response;
};

/**
 * Delete an user from the application.
 *
 * @param {String} authy_id The `authy_id` returned when registering the user.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.deleteUser = function *(authy_id) {
  validate({
    authy_id: authy_id,
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ]
  });

  var response = yield request.post(this.url('/protected/json/users/delete/{authy_id}', { authy_id: authy_id }), {
    qs: this.qs()
  });

  return parse(response);
};

/**
 * Retrieve an user status.
 *
 * @param {String} authy_id The `authy_id` returned when registering the user.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getUserStatus = function *(authy_id) {
  validate({
    authy_id: authy_id,
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ]
  });

  var response = yield request.get(this.url('/protected/json/users/{authy_id}/status', { authy_id: authy_id }), {
    qs: this.qs()
  });

  response = parse(response);

  if (!response.status) {
    throw new AuthyError('`status` is missing', { body: response });
  }

  return response;
};

/**
 * Register an user activity.
 *
 * @param {String} authy_id The `authy_id` returned when registering the user.
 * @param {String} type One of the following: ['password_reset', 'banned', 'unbanned', 'cookie_login']
 * @param {String} ip The IPv4 or IPv6 of the user.
 * @param {Object} data Hash of data to correlate with the activity.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.registerActivity = function *(authy_id, type, ip, data) {
  validate({
    authy_id: authy_id,
    type: type,
    ip: ip,
    data: data
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    type: [
      new Assert().Required(),
      new Assert().Choice(['password_reset', 'banned', 'unbanned', 'cookie_login'])
    ],
    ip: [
      new Assert().Required(),
      new Assert().Callback(function(value) {
        var result = net.isIP(value);

        return 4 === result || 6 === result;
      })
    ],
    data: [
      new Assert().Required()
    ]
  });

  var response = yield request.post(this.url('/protected/json/users/{authy_id}/register_activity', { authy_id: authy_id }), {
    form: {
      ip: ip,
      type: type,
      data: data
    },
    qs: this.qs()
  });

  return parse(response);
};

/**
 * Retrieves the application details.
 *
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getApplicationDetails = function *() {
  var response = yield request.get(this.url('/protected/json/app/details'), {
    qs: this.qs()
  });

  return parse(response);
};

/**
 * Retrieves the application statistics.
 *
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getApplicationStatistics = function *() {
  var response = yield request.get(this.url('/protected/json/app/stats'), {
    qs: this.qs()
  });

  return parse(response);
};

/**
 * Export constructor
 */

module.exports = AuthyClient;
