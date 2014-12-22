
/**
 * Module dependencies.
 */

var PhoneNumber = require('google-libphonenumber').PhoneNumber;
var PNF = require('google-libphonenumber').PhoneNumberFormat;
var e164 = require('../../lib/formatters/phone-number-formatter').e164;
var phoneUtil = require('google-libphonenumber').phoneUtil;
var sinon = require('sinon');

/**
 * Test `PhoneNumberFormatter`.
 */

describe('PhoneNumberFormatter', function() {
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
