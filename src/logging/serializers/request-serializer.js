
/**
 * Export `serialize`.
 *
 * @param {Mixed} request
 * @return {Object}
 */

module.exports.serialize = function requestSerializer(request) {
  if (!request || !request.toJSON) {
    return request;
  }

  var json = request.toJSON();

  json.uri = json.uri.href.replace(/(api_key=)([^&])*/g, '$1*****');

  if (request.body) {
    json.body = request.body.toString('utf8');
  }

  return json;
};
