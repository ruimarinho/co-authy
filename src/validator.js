
/**
 * Module dependencies.
 */

import _ from 'lodash';
import AuthyValidationFailedError from './errors/authy-validation-failed-error';
import { Assert as ValidatorAssert, Validator } from 'validator.js';
import debugnyan from 'debugnyan';
import assertExtras from 'validator.js-asserts';
import allAsserts from './asserts';

const asserts = _.merge({}, assertExtras, allAsserts);
const validator = new Validator();
const log = debugnyan('authy:validator');

/**
 * Validate data using constraints.
 */

export let validate = function(data, constraints) {
  var errors = validator.validate(data, constraints);

  if (true !== errors) {
    log.warn({ errors: errors }, 'Validation failed');

    throw new AuthyValidationFailedError(errors);
  }
};

/**
 * Export `Assert`.
 */

export const Assert = ValidatorAssert.extend(asserts);
