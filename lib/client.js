/* jshint camelcase:false */

/**
 * Module dependencies.
 */

var Assert = require('./validator').Assert;
var AuthyError = require('../errors/authy-error');
var _ = require('lodash');
var debug = require('debug')('authy:client');
var e164 = require('./formatters/phone-number-formatter').e164;
var http = require('co-request');
var net = require('net');
var parse = require('./response');
var parseRawInput = require('./parsers/input-parser').parseRawInput;
var sf = require('sf');
var util = require('util');
var validate = require('./validator').validate;

/**
 * Expose an `AuthyClient`.
 */

module.exports = AuthyClient;

/**
 * Initialize a new `AuthyClient` with Authy's `API key` and an
 * optional dictionary of `options`.
 *
 * @param {String} apiKey
 * @param {Object} options (optional)
 *   @property {String} host (default: 'https://api.authy.com')
 */

function AuthyClient(apiKey, options) {
  if (!(this instanceof AuthyClient)) return new AuthyClient(apiKey, options);

  validate({
    api_key: apiKey
  }, {
    api_key: [
      new Assert().Required()
    ]
  });

  options = options || {};

  this.apiKey = apiKey;
  this.apiUrl = options.host || 'https://api.authy.com';
  this.qs = function qs(obj) {
    obj = _.merge({
      api_key: this.apiKey
    }, obj || {});

    return _.omit(obj, _.isUndefined);
  };

  this.url = function url() {
    var args = _.toArray(arguments);

    return util.format('%s/protected/json/%s', this.apiUrl, sf.apply(this, args));
  };
}

/**
 * Enable two-factor authentication on a user. You should store the returned
 * `authyId` in your database for subsequent calls.
 *
 * @param {String} email The email to match the user to.
 * @param {String} cellphone You can use dashes, periods or spaces to
 *                           separate the numbers. Country code should be
 *                           sent separately.
 * @param {String} code Can be an ISO 3166-1 alpha-2 code, (e.g. PT) or an
                        or a calling code (e.g. 351). Defaults to US (1) if
                        omitted.
 * @return {Integer} The `authyId` of the registered user.
 * @api public
 */

AuthyClient.prototype.registerUser = function *(email, cellphone, code) {
  var parsed = parseRawInput(cellphone, code);

  var data = {
    email: email,
    cellphone: parsed.cellphone,
    country_code: parsed.countryCallingCode
  };

  validate(data, {
    email: [
      new Assert().Required(),
      new Assert().Email()
    ],
    cellphone: [
      new Assert().Required(),
      new Assert().PhoneNumber(parsed.countryCode)
    ],
    country_code: [
      new Assert().Required(),
      new Assert().CountryCallingCode()
    ]
  });

  try {
    data.cellphone = e164(data.cellphone, parsed.countryCode).replace('+' + parsed.countryCallingCode, '');
  } catch (e) {}

  debug('Registering user [email=%s, cellphone=%s, cellphone_raw=%s, country_code=%s, country_calling_code=%s]',
    email, data.cellphone, cellphone, parsed.countryCode, parsed.countryCallingCode);

  var response = yield http.post(this.url('users/new'), {
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
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {String} token The token entered by the user to verify.
 * @param {Object} options (optional)
 *   @property {Boolean} force
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.verifyToken = function *(authyId, token, options) {
  options = options || {};

  validate({
    authy_id: authyId,
    token: token,
    force: options.force
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    token: [
      new Assert().Required(),
      new Assert().TotpToken()
    ],
    force: [
      new Assert().Callback(_.isBoolean)
    ]
  });

  var response = yield http.get(this.url('verify/{token}/{authyId}', { authyId: authyId, token: token }), {
    qs: this.qs({
      force: options.force
    })
  });

  return parse(response);
};

/**
 * Request an SMS with a token for users that don't own a smartphone. If the
 * Authy app is in use by the user, this request is ignored. Pass `force` to
 * send an SMS regardless of this. You can also use the `shortcode` option to
 * send the SMS using short code (available in US and Canada).
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {Object} options (optional)
 *   @property {Boolean} force
 *   @property {Boolean} shortcode
 * @return {String} The cellphone number to which the call was made.
 * @api public
 */

AuthyClient.prototype.requestSms = function *(authyId, options) {
  options = options || {};

  validate({
    authy_id: authyId,
    force: options.force,
    shortcode: options.shortcode
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    force: [
      new Assert().Callback(_.isBoolean)
    ],
    shortcode: [
      new Assert().Callback(_.isBoolean)
    ]
  });

  var response = yield http.get(this.url('sms/{authyId}', { authyId: authyId }), {
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
 * Request a call with a token for users that don't own a smartphone or are
 * having trouble with SMS. If the Authy app is in use by the user, this
 * request is ignored. Pass `force` to call the user regardless of this.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {Object} options (optional)
 *   @property {Boolean} force
 * @return {String} The cellphone number to which the call was made.
 * @api public
 */

AuthyClient.prototype.requestCall = function *(authyId, options) {
  options = options || {};

  validate({
    authy_id: authyId,
    force: options.force,
    shortcode: options.shortcode
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    force: [
      new Assert().Callback(_.isBoolean)
    ]
  });

  var response = yield http.get(this.url('call/{authyId}', { authyId: authyId }), {
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
 * @param {String} authyId The `authyId` returned when registering the user.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.deleteUser = function *(authyId) {
  validate({
    authy_id: authyId,
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ]
  });

  var response = yield http.post(this.url('users/delete/{authyId}', { authyId: authyId }), {
    qs: this.qs()
  });

  return parse(response);
};

/**
 * Retrieve user status.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getUserStatus = function *(authyId) {
  validate({
    authy_id: authyId,
  }, {
    authy_id: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ]
  });

  var response = yield http.get(this.url('users/{authyId}/status', { authyId: authyId }), {
    qs: this.qs()
  });

  response = parse(response);

  if (!response.status) {
    throw new AuthyError('`status` is missing', { body: response });
  }

  return response;
};

/**
 * Register user activity.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {String} type One of the following: ['password_reset', 'banned', 'unbanned', 'cookie_login']
 * @param {String} ip The IPv4 or IPv6 of the user.
 * @param {Object} data Hash of data to correlate with the activity.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.registerActivity = function *(authyId, type, ip, data) {
  validate({
    authy_id: authyId,
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

  var response = yield http.post(this.url('users/{authyId}/register_activity', { authyId: authyId }), {
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
 * Retrieve application details.
 *
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getApplicationDetails = function *() {
  var response = yield http.get(this.url('app/details'), {
    qs: this.qs()
  });

  return parse(response);
};

/**
 * Retrieve application statistics.
 *
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getApplicationStatistics = function *() {
  var response = yield http.get(this.url('app/stats'), {
    qs: this.qs()
  });

  return parse(response);
};
