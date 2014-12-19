
/**
 * Module dependencies.
 */

var _ = require('lodash');
var PNF = require('google-libphonenumber').PhoneNumberFormat;
var PNT = require('google-libphonenumber').PhoneNumberType;
var countriesMetadata = require('world-countries');
var phoneMetadata = require('google-libphonenumber').metadata;
var phoneUtil = require('google-libphonenumber').phoneUtil;

/**
 * Export a list of countries with associated metadata include a mobile phone
 * number example, if one is available. Non-geographical entities are not
 * included.
 *
 * @return {Object}
 */

module.exports = function getCountries() {
  var countriesMetadataByCca2 = _.indexBy(countriesMetadata, 'cca2');

  return _.chain(phoneMetadata.countryToMetadata)
    .map(function(metadata, countryCode) {
      // E.g. `PT` -> `351`.
      var callingCode = phoneUtil.getCountryCodeForRegion(countryCode);

      // Get example of mobile phone number type.
      var phoneNumber = phoneUtil.getExampleNumberForType(countryCode, PNT.MOBILE);

      // E.g. `912 345 678` for `PT`.
      var examplePhoneNumber = phoneNumber ? phoneUtil.format(phoneNumber, PNF.NATIONAL) : null;

      var country = {
        cca2: countryCode,
        callingCode: callingCode,
        examplePhoneNumber: examplePhoneNumber
      };

      // Metadata not available (possibly a non-geographical entity).
      if (!_.has(countriesMetadataByCca2, countryCode)) {
        return;
      }

      return _.defaults(country, countriesMetadataByCca2[countryCode]);
    })
    .filter()
    .value();
};
