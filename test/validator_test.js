
/**
 * Module dependencies.
 */

var ValidationFailedError = require('../lib/errors/authy-validation-failed-error');
var Assert = require('validator.js').Assert;
var should = require('should');
var validator = require('../lib/validator');

/**
 * Test `Validator`.
 */

describe('Validator', function() {
  describe('validate()', function() {
    it('should throw an error if validation fails', function() {
      try {
        validator.validate({ name: 'Foo' }, { name: new Assert().Null() });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(ValidationFailedError);
        e.errors.name.should.have.length(1);
        e.errors.name[0].show().assert.should.equal('Null');
      }
    });
  });
});
