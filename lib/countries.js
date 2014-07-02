
/**
 * Module dependencies
 */

var _ = require('lodash');
var countries = require('../data/countries');

countries.unshift({
  name: 'International Networks',
  callingCode: ['882']
});

countries.unshift({
  name: 'International Networks2',
  callingCode: ['883']
});

module.exports.cca2 = _.indexBy(countries, 'cca2');
module.exports.cca3 = _.indexBy(countries, 'cca3');
module.exports.codes = _.chain(countries).pluck('callingCode').flatten().filter().value();
