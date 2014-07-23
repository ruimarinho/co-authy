
/**
 * Module dependencies
 */

var _ = require('lodash');
var countries = require('world-countries');

/**
 * Add non-geographical entities as supported by Authy.
 */

countries.unshift({
  name: 'International Networks',
  callingCode: ['882', '883'],
  cca2: '001',
});

/**
 * Index by ISO 3166-1 alpha-2 codes. Allows easy conversion from an alpha
 * code to a country calling code. E.g. PT -> 351. Under rare scenarios, a
 * country may have multiple country calling codes assigned (e.g. Dominican
 * Republic). THe first number one is considered the main / most popularly
 * used one.
 */

module.exports.cca2 = _.indexBy(countries, 'cca2');

/**
 * Index by ISO 3166-1 alpha-3 codes. Allows easy conversion from an alpha
 * code to a country calling code. E.g. PRT -> 351.
 *
 * @return {Object}
 */

module.exports.cca3 = _.indexBy(countries, 'cca3');

/**
 * Pluck all available calling codes. The result is a flattened list of all
 * possible country calling codes to make sure it passes Authy validation.
 *
 * @return {Array} Format: [ '882', '883', '93', '358', ... ]
 */

module.exports.callingCodes = _.chain(countries).pluck('callingCode').flatten().filter().value();
