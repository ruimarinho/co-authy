
/**
 * Module dependencies.
 */
var PhoneNumber = require('google-libphonenumber').PhoneNumber;
var PNF = require('google-libphonenumber').PhoneNumberFormat;
var e164 = require('../../lib/parsers/phone-parser').e164;
var parse = require('../../lib/parsers/phone-parser').parse;
var phoneUtil = require('google-libphonenumber').phoneUtil;
var sinon = require('sinon');

/**
 * Test `PnputParser`.
 */

describe('PhoneParser', function() {
  describe('parse()', function() {
    it('should default to `US` if `code` is missing', function *() {
      parse('408-555-5555').should.eql({
        phone: '408-555-5555',
        countryCallingCode: 1,
        countryCode: 'US'
      });
    });

    it('should not throw an error if `code` is not recognized', function *() {
      parse('408-555-5555', 'OO').should.eql({
        phone: '408-555-5555',
        countryCallingCode: 'OO',
        countryCode: 'OO'
      });
    });

    it('should support an ambiguous `code` in the numeric format', function *() {
      parse('408-555-5555', '1').should.eql({
        phone: '408-555-5555',
        countryCallingCode: 1,
        countryCode: '1'
      });
    });

    it('should support a valid `code` in the numeric format', function *() {
      parse('915555555', '351').should.eql({
        phone: '915555555',
        countryCallingCode: 351,
        countryCode: 'PT'
      });
    });

    it('should support a valid `code` in the ISO 3166-1 alpha-2 format', function *() {
      parse('915555555', 'PT').should.eql({
        phone: '915555555',
        countryCallingCode: 351,
        countryCode: 'PT'
      });
    });

    it('should support a number with the international sign', function *() {
      parse('+351915555555', '351').should.eql({
        phone: '+351915555555',
        countryCallingCode: 351,
        countryCode: 'PT'
      });
    });

    it('should support the non-geographical entity `882`', function *() {
      parse('13300655', '882').should.eql({
        phone: '+88213300655',
        countryCallingCode: 882,
        countryCode: '001'
      });
    });

    it('should support the non-geographical entity `883`', function *() {
      parse('510012345', '883').should.eql({
        phone: '+883510012345',
        countryCallingCode: 883,
        countryCode: '001'
      });
    });
  });

  describe('e164()', function() {
    it('should call `phoneUtil.format`', function() {
      sinon.spy(phoneUtil, 'format');

      e164('9123456789', 'PT');

      phoneUtil.format.callCount.should.equal(1);
      phoneUtil.format.firstCall.args.should.have.length(2);
      phoneUtil.format.firstCall.args[0].should.be.instanceOf(PhoneNumber);
      phoneUtil.format.firstCall.args[1].should.equal(PNF.E164);
      phoneUtil.format.restore();
    });

    it('should call `phoneUtil.parse`', function() {
      sinon.spy(phoneUtil, 'parse');

      e164('9123456789', 'PT');

      phoneUtil.parse.callCount.should.equal(1);
      phoneUtil.parse.firstCall.args.should.have.length(2);
      phoneUtil.parse.firstCall.args[0].should.equal('9123456789');
      phoneUtil.parse.firstCall.args[1].should.equal('PT');
      phoneUtil.parse.restore();
    });
  });
});
