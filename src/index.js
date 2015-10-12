
/**
 * Module dependencies.
 */

import _ from 'lodash';
import AuthyError from './errors/authy-error';
import Promise from 'bluebird';
import debugnyan from 'debugnyan';
import phoneParser from './parsers/phone-parser';
import request from 'request';
import { Assert } from './validator';
import { parse } from './parsers/response-parser';
import { validate } from './validator';

const log = debugnyan('authy');

/**
 * Initialize a new `AuthyClient` with Authy's API `key` and an
 * optional dictionary of `options`.
 *
 * @param {String} key The API `key`.
 * @param {Object} options Optional `options` dictionary.
 *   @property {String} host (default: 'https://api.authy.com')
 */

export default class AuthyClient {
  constructor({ key } = {}, { host } = { host: 'https://api.authy.com' }) {
    validate({ key }, { key: new Assert().Required() });

    this.key = key;
    this.host = host;
    this.request = Promise.promisifyAll(request.defaults({
      baseUrl: `${this.host}/protected/json/`,
      qs: {
        api_key: this.key
      }
    }));

    log.debug({ host: this.host }, 'Host set');
  }

  /**
   * Delete a user from the application.
   *
   * @param {Object} Parameters.
   *   @property {String} The authyId returned when registering the user.
   * @return {Promise<Object>}
   * @api public
   */

  deleteUser({ authyId } = {}) {
    log.debug('Deleting user');

    validate({ authyId }, { authyId: [new Assert().Required(), new Assert().AuthyId()] });

    return this.request.postAsync(`users/delete/${authyId}`).then(parse);
  };

  /**
   * Retrieve application details.
   *
   * @return {Promise<Object>}
   * @api public
   */

  getApplicationDetails() {
    log.debug('Retrieving application details');

    return this.request.getAsync('app/details').then(parse);
  }

  /**
   * Retrieve application statistics.
   *
   * @return {Promise<Object>}
   * @api public
   */

  getApplicationStatistics() {
    log.debug('Retrieving application statistics');

    return this.request.getAsync('app/stats').then(parse);
  }

  /**
   * Retrieve a user status.
   *
   * @param {Object} Parameters.
   *   @property {String} authyId The `authyId` returned when registering the user.
   * @return {Promise<Object>}
   * @api public
   */

  getUserStatus({ authyId } = {}) {
    log.debug('Retrieving user status');

    validate({ authyId }, { authyId: [new Assert().Required(), new Assert().AuthyId()] });

    return this.request.postAsync(`users/${authyId}/status`).then(parse);
  }

  /**
   * Register a user activity.
   *
   * @param {Object} Parameters.
   *   @property {String} The authyId returned when registering the user.
   *   @property {String} type The type of activity.
   *   @property {String} ip The IP (v4 or v6) of the user.
   *   @property {Object} data Hash of data to associate with the activity.
   * @return {Promise<Object>}
   * @api public
   */

  registerActivity({ authyId, data, ip, type } = {}) {
    log.debug('Registering activity');

    validate({ authyId, data, ip, type }, {
      authyId: [new Assert().Required(), new Assert().AuthyId()],
      data: [new Assert().Required(), new Assert().PlainObject()],
      ip: [new Assert().Required(), new Assert().Ip()],
      type: [new Assert().Required(), new Assert().Activity()]
    });

    return this.request.postAsync(`users/${authyId}/register_activity`, { form: { data, ip, type } }).then(parse);
  }

  /**
   * Enable two-factor authentication on a user. You should store the returned
   * `authyId` in your database for subsequent calls.
   *
   * @param {Object} Parameters.
   *   @property {String} email The email to match the user to.
   *   @property {String} phone You can use dashes, periods or spaces to separate
   *     the numbers. Country code should be sent separately.
   * @param {String} code Can be an ISO 3166-1 alpha-2 code, (e.g. PT) or an or a
   *   calling code (e.g. 351). Defaults to US (1) if omitted.
   * @return {Promise<Number>} The `authyId` of the registered user.
   * @api public
   */

  registerUser({ email, phone, countryCode } = {}) {
    log.debug('Registering user');

    const parsedPhone = phoneParser.parse(phone, countryCode);

    let { cellphone: number, countryBCode: countryCode, countryCallingCode: countryCallingCode } = parsedPhone.number;

    validate({
      email,
      cellphone,
      countryCode
    }, {
      email: [new Assert().Required(), new Assert().Email()],
      cellphone: [new Assert().Required(), new Assert().PhoneNumber(countryCode)],
      countryCode: [new Assert().Required(), new Assert().CountryCallingCode()]
    });

    try {
      console.log('CELPHONE IS', phoneParser.e164(parsedPhone.number, countryCode));

      cellphone = phoneParser.e164(parsedPhone.number, countryCode).replace('+' + `${countryCallingCode}`);
    } catch (e) {
      log.warn(_.defaults({ e }, phone), 'Unable to format phone as e164');
    }

    console.log('-----------------------',  { email, cellphone, country_code: countryCallingCode });

    return this.request.postAsync('users/new', { form: { user: { email, cellphone, country_code: countryCallingCode }}}).then(parse);
  }

  /**
   * Request a call with a token for users that don't own a smartphone or are
   * having trouble with SMS. If the Authy app is in use by the user, this
   * request is ignored. Pass `force` to call the user regardless of this.
   *
   * @param {Object} Parameters.
   *   @property {String} authyId The `authyId` returned when registering the user.
   * @param {Object} Optional `options` dictionary.
   *   @property {Boolean} force Whether to force the phone call.
   * @return {Promise<Object>}
   * @api public
   */

  requestCall({ authyId } = {}, { force } = { force: false }) {
    log.debug('Requesting call');

    validate({ authyId, force }, {
      authyId: [new Assert().Required(), new Assert().AuthyId()],
      force: new Assert().Boolean()
    });

    return this.request.getAsync(`call/${authyId}`, { qs: _.pick({ force, action, actionMessage }, _.identity) }).then(parse);
  }

  /**
   * Request an SMS with a token for users that don't own a smartphone. If the
   * Authy app is in use by the user, this request is ignored. Pass `force` to
   * send an SMS regardless of this. You can also use the `shortcode` option to
   * send the SMS using shortcodes (available in the US and Canada).
   *
   * @param {Object} Parameters.
   *   @property {String} authyId The `authyId` returned when registering the user.
   * @param {Object} options Optional `options` dictionary.
   *   @property {Boolean} force Whether to force the phone call.
   *   @property {Boolean} shortcode Whether to use shortcodes.
   * @return {Promise<Object>}
   * @api public
   */

  requestSms({ authyId } = {}, { action, actionMessage, force, shortcode } = { force: false, shortcode: false }) {
    log.debug('Requesting SMS');

    validate({ authyId, force, shortcode }, {
      action: new Assert().Length(255),
      actionMessage: new Assert().Length(255),
      authyId: [new Assert().Required(), new Assert().AuthyId()],
      force: new Assert().Boolean(),
      shortcode: new Assert().Boolean()
    });

    return this.request.getAsync(`sms/${authyId}`, { qs: _.pick({ action, actionMessage, force, shortcode }, _.identity) }).then(parse);
  }

 /**
  * Verify a token entered by a user. Enable the `force` parameter to verify
  * the token regardless of the user login status.
  *
  * @param {Object} Parameters.
  *   @property {String} authyId The `authyId` returned when registering the user.
  *   @property {String} token The `token` entered by the user to verify.
  * @param {Object} options Optional `options` dictionary.
  *   @property {Boolean} force
  * @return {Promise<Object>}
  * @api public
  */

  verifyToken({ authyId, token } = {}, { action, force } = { force: false }) {
    log.debug('Verifying token');

    validate({ authyId, token, force }, {
      action: new Assert().Length(255),
      authyId: [new Assert().Required(), new Assert().AuthyId()],
      token: [new Assert().Required(), new Assert().TotpToken()],
      force: new Assert().Boolean()
    });

    return this.request.getAsync(`verify/${token}/${authyId}`, { qs: _.pick({ action, force }, _.identity) }).then(parse);
  }
};
