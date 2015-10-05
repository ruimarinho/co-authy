
/**
 * Module dependencies.
 */

var Assert = require('validator.js').Assert;
var Validator = require('validator.js').Validator;
var Violation = require('validator.js').Violation;
var assert = require('../../lib/asserts/activity-assert');
var activities = require('../../lib/constants').activities;
var should = require('should');

/**
 * Test `ActivityAssert`.
 */

describe('ActivityAssert', function() {
  before(function() {
    Assert.prototype.Activity = assert;
  });

  it('should throw an error if the activity is not a string', function() {
    [[], {}, 123].forEach(function(choice) {
      try {
        new Assert().Activity().validate(choice);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        /* jshint camelcase: false */
        e.violation.value.should.equal(Validator.errorCode.must_be_a_string);
        /* jshint camelcase: true */
      }
    });
  });

  it('should throw an error if the activity is invalid', function() {
    ['foo'].forEach(function(code) {
      try {
        new Assert().Activity().validate(code);

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Violation);
        e.show().assert.should.equal('Activity');
      }
    });
  });

  it('should accept a valid activity', function() {
    activities.forEach(function(code) {
      try {
        new Assert().Activity().validate(code);
      } catch (e) {
        console.error(e);
        console.error(e.stack);

        throw e;
      }
    });
  });
});
