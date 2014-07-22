
/**
 * Test dependencies
 */


require('should');

var parse = require('../../lib/parsers/input-parser').parseRawInput;

/**
 * Input Parser tests
 */

describe('Input Parser', function() {
  describe('#parseRawInput', function() {
    it('should default to `US` if `code` is missing', function *() {
      parse('408-555-5555').should.eql({
        cellphone: '408-555-5555',
        countryCode: 'US',
        countryCallingCode: '1'
      });
    });

    it('should not throw an error if `code` is not recognized', function *() {
      parse('408-555-5555', 'OO').should.eql({
        cellphone: '408-555-5555',
        countryCode: 'OO',
        countryCallingCode: 'OO'
      });
    });

    it('should support an ambiguous `code` in the numeric format', function *() {
      parse('408-555-5555', '1').should.eql({
        cellphone: '408-555-5555',
        countryCode: '1',
        countryCallingCode: '1'
      });
    });

    it('should support a valid `code` in the numeric format', function *() {
      parse('915555555', '351').should.eql({
        cellphone: '915555555',
        countryCode: 'PT',
        countryCallingCode: '351'
      });
    });

    it('should support a valid `code` in the ISO 3166-1 alpha-3 format', function *() {
      parse('915555555', 'PRT').should.eql({
        cellphone: '915555555',
        countryCode: 'PT',
        countryCallingCode: '351'
      });
    });

    it('should support a valid `code` in the ISO 3166-1 alpha-2 format', function *() {
      parse('915555555', 'PT').should.eql({
        cellphone: '915555555',
        countryCode: 'PT',
        countryCallingCode: '351'
      });
    });

    it('should support a number with the international sign', function *() {
      parse('+351915555555', '351').should.eql({
        cellphone: '+351915555555',
        countryCode: 'PT',
        countryCallingCode: '351'
      });
    });

    it('should support the non-geographical entity `882`', function *() {
      parse('13300655', '882').should.eql({
        cellphone: '+88213300655',
        countryCode: '001',
        countryCallingCode: '882'
      });
    });

    it('should support the non-geographical entity `883`', function *() {
      parse('510012345', '883').should.eql({
        cellphone: '+883510012345',
        countryCode: '001',
        countryCallingCode: '883'
      });
    });
  });
});
