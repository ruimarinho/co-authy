
/**
 * Module dependencies.
 */

import { Assert, Validator, Violation } from 'validator.js';

/**
 * Export `AuthyIdAssert`.
 */

export default function() {
  // Class name.
  this.__class__ = 'AuthyId';

  // Validation algorithm.
  this.validate = value => {
    if (true !== new Assert().GreaterThan(0).check(value)) {
      throw new Violation(this, value);
    }

    return true;
  };

  return this;
};
