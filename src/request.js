
/**
 * Module dependencies.
 */

var _ = require('lodash');
var http = require('request');
// var logging = require('./logging/logger');
var moduleLogger = logging.createLogger('request');
var methods = ['get', 'patch', 'post', 'put', 'head', 'del'];

methods.forEach(function(method) {
  http[method] = _.wrap(http[method], function(fn, uri, options, callback) {
    options = options || {};

    var logger = logging.getLogger(moduleLogger, options);
    var request = fn.call(this, uri, options, callback);

    logger.debug({ request: request }, 'Preparing request');

    return request;
  });
});

module.exports = require('thenify-all')(http, methods);
