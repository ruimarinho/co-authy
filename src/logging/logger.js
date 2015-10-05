
/**
 * Module dependencies.
 */

var _ = require('lodash');
var Logger = require('bunyan');
var bunyan = require('bunyan');
var requestSerializer = require('./serializers/request-serializer').serialize;
var responseSerializer = require('./serializers/response-serializer').serialize;

/**
 * Initialize `lugg` root logger.
 */

module.exports.initialize = function() {
  return lugg.init({
    name: 'authy',
    level: process.env.DEBUG ? 'debug' : (bunyan.FATAL + 1),
    serializers: {
      request: requestSerializer,
      response: responseSerializer,
      error: bunyan.stdSerializers.err
    }
  });
};

module.exports.createLogger = function(key) {
  return lugg(key);
};

module.exports.getLogger = function(logger, options) {
  options = options || {};

  if (options.logger) {
    if (options.logger instanceof Logger) {
      return options.logger.child(_.defaults({ module: logger.fields.module }, options.child || {}), true);
    }

    return options.logger;
  }

  if (options.child) {
    return logger.child(options.child, true);
  }

  return logger;
};
