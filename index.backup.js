/**
 * Enable two-factor authentication on a user. You should store the returned
 * `authyId` in your database for subsequent calls.
 *
 * @param {String} email The email to match the user to.
 * @param {String} phone You can use dashes, periods or spaces to
 *  separate the numbers. Country code should be sent separately.
 * @param {String} code Can be an ISO 3166-1 alpha-2 code,
 *  (e.g. PT) or an or a calling code (e.g. 351). Defaults to US (1) if
 *  omitted.
 * @return {Integer} The `authyId` of the registered user.
 * @api public
 */

AuthyClient.prototype.registerUser = Promise.method((email, phone, code, options) => {
  options = options || {};

  var logger = logging.getLogger(logger, _.defaults({ child: { email: email }}, options));

  var user = {
    email: email,
    phone: phone,
    code: code
  };

  logger.debug(user, 'Registering user');

  phone = phoneParser.parse(phone, code, { logger: logger });

  var data = {
    email: user.email,
    cellphone: phone.phone,
    countryCode: phone.countryCallingCode
  };

  validate(data, {
    email: [
      new Assert().Required(),
      new Assert().Email()
    ],
    cellphone: [
      new Assert().Required(),
      new Assert().PhoneNumber(phone.countryCode)
    ],
    countryCode: [
      new Assert().Required(),
      new Assert().CountryCallingCode()
    ]
  }, { logger: logger });

  try {
    data.cellphone = phoneParser.e164(phone.phone, phone.countryCode, { logger: logger }).replace('+' + phone.countryCallingCode, '');
  } catch (e) {
    logger.error(_.defaults({ error: e }, phone), 'Unable to format phone as e164');
  }

  return request.postAsync(this.url('users/new'), {
    form: { user: _.transform(data, _.snakeCase) },
    qs: this.qs()
  }).then(function(response) {
    response = responseParser.parse(response, { logger: logger });

    if (!response.user || !response.user.id) {
      logger.error('Unable to register user because `user.id` is missing on response');

      throw new AuthyError('`user.id` is missing', { body: response });
    }

    return response;
  });
};

/**
 * Verify a token entered by a user. Enable the `force` parameter to verify
 * the token regardless of the user login status.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {String} token The `token` entered by the user to verify.
 * @param {Object} options Optional `options` dictionary.
 *   @property {Boolean} force
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.verifyToken = Promise.method((authyId, token, options) => {
  options = options || {};

  var data = {
    authyId: authyId,
    token: token,
    force: options.force
  };

  logger.debug(data, 'Verifying token');

  validate(data, {
    authyId: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    token: [
      new Assert().Required(),
      new Assert().TotpToken()
    ],
    force: [
      new Assert().Boolean()
    ]
  }, { logger: logger });

  return request.getAsync(this.url('verify/{token}/{authyId}', { authyId: authyId, token: token }), {
    qs: this.qs(_.pick(data, 'force'))
  }).then(_.partialRight(responseParser.parse, { logger: logger }));
});

/**
 * Request an sms with a token for users that don't own a smartphone. If the
 * Authy app is in use by the user, this request is ignored. Pass `force` to
 * send an sms regardless of this. You can also use the `shortcode` option to
 * send the sms using short code (available in US and Canada).
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {Object} options Optional `options` dictionary.
 *   @property {Boolean} force
 *   @property {Boolean} shortcode
 * @return {String} The cellphone number to which the call was made.
 * @api public
 */

AuthyClient.prototype.requestSms = Promise.method((authyId, options) => {
  options = options || {};

  var data = {
    authyId: authyId,
    force: options.force,
    shortcode: options.shortcode
  };

  logger.debug(data, 'Requesting sms');

  validate(data, {
    authyId: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    force: [
      new Assert().Boolean()
    ],
    shortcode: [
      new Assert().Boolean()
    ]
  }, { logger: logger });

  return request.getAsync(this.url('sms/{authyId}', { authyId: authyId }), {
    qs: this.qs(_.pick(data, 'force', 'shortcode'))
  }).then(function(response) {
    response = responseParser.parse(response, { logger: logger });

    if (!response.cellphone) {
      logger.error(data, 'Unexpected response when requesting sms (missing `cellphone` field)');

      throw new AuthyError('`cellphone` is missing', { body: response });
    }

    return response;
  });
});

/**
 * Request a call with a token for users that don't own a smartphone or are
 * having trouble with sms. If the Authy app is in use by the user, this
 * request is ignored. Pass `force` to call the user regardless of this.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @param {Object} options Optional `options` dictionary.
 *   @property {Boolean} force
 * @return {String} The cellphone number to which the call was made.
 * @api public
 */

AuthyClient.prototype.requestCall = Promise.method((authyId, options) => {
  options = options || {};

  var data = {
    authyId: authyId,
    force: options.force,
    shortcode: options.shortcode
  };

  logger.debug(data, 'Requesting call');

  validate(data, {
    authyId: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ],
    force: [
      new Assert().Boolean()
    ]
  }, { logger: logger });

  return request.getAsync(this.url('call/{authyId}', { authyId: authyId }), {
    qs: this.qs(_.pick(data, 'force'))
  }).then(function(response) {
    response = responseParser.parse(response, { logger: logger });

    if (!response.cellphone) {
      logger.error(data, 'Unexpected response when requesting call (missing `cellphone` field)');

      throw new AuthyError('`cellphone` is missing', { body: response });
    }
  });
});

/**
 * Delete a user from the application.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.deleteUser = Promise.method((authyId, options) => {
  options = options || {};

  var data = {
    authyId: authyId
  };

  logger.debug(data, 'Deleting user');

  validate(data, {
    authyId: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ]
  }, { logger: logger });

  return request.postAsync(this.url('users/delete/{authyId}', { authyId: authyId }), {
    qs: this.qs()
  }).then(_.partialRight(responseParser.parse, { logger: logger }));
});

/**
 * Retrieve a user status.
 *
 * @param {String} authyId The `authyId` returned when registering the user.
 * @return {Object}
 * @api public
 */

AuthyClient.prototype.getUserStatus = Promise.method((authyId, options) => {
  options = options || {};

  var data = {
    authyId: authyId
  };

  logger.debug(data, 'Retrieving user status');

  validate(data, {
    authyId: [
      new Assert().Required(),
      new Assert().GreaterThan(0)
    ]
  }, { logger: logger });

  return request.getAsync(this.url('users/{authyId}/status', { authyId: authyId }), {
    qs: this.qs()
  }).then((response) => {
    response = responseParser.parse(response, { logger: logger });

    if (!response.status) {
      logger.error(data, 'Unexpected response when retrieving user status (missing `status` field)');

      throw new AuthyError('`status` is missing', { body: response });
    }

    return response;
  });
});
