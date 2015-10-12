
/**
 * Export `serializer`.
 *
 * @param {Mixed} response
 * @return {Object}
 */

module.exports.serialize = function responseSerializer(response) {
  if (!response || !response.toJSON) {
    return response;
  }

  var json = response.toJSON();

  json.request.uri = json.request.uri.href.replace(/(api_key=)([^&])*/g, '$1*****');

  return json;
};
