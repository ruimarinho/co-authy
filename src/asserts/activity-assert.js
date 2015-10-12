
/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var choices = require('../constants').activities;

/**
 * Export `ActivityAssert`.
 */

module.exports = function() {
  // Class name.
  this.__class__ = 'Activity';

  // Validation algorithm.
  this.validate = function(value) {
    if ('string' !== typeof value) {
      /* jshint camelcase: false */
      throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
      /* jshint camelcase: true */
    }

    if (true !== new Assert().Choice(choices).check(value)) {
      throw new Violation(this, value, { choices: choices });
    }

    return true;
  };

  return this;
};
