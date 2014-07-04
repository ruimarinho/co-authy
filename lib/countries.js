
/**
 * Module dependencies
 */

var _ = require('lodash');
var countries = require('../data/countries');

/**
 * Add non-geo entities
 */

countries.unshift({
  name: 'International Networks',
  callingCode: ['882', '883'],
  cca2: '001',
});

/**
 * Index by ISO 3166-1 alpha-2 codes
 */

module.exports.cca2 = _.indexBy(countries, 'cca2');

/**
 * Index by ISO 3166-1 alpha-3 codes
 */

module.exports.cca3 = _.indexBy(countries, 'cca3');

/**
 * Pluck all available calling codes
 */

module.exports.callingCodes = _.chain(countries).pluck('callingCode').flatten().filter().value();
