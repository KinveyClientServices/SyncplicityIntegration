const request = require("request");
const serverCredentials = require("../serverCredentials.js");

module.exports.syncplicityRequest = function(params, callback) {
  serverCredentials.authenticate(function(error, accessToken) {
    const defaultParams = {
			"method": "",
			"uri": "",
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"Appkey": "l5GC4PTU1GAgY3fGwkfKXP4vtjYKFOUZ",
				"Authorization": "Bearer " + accessToken
			}
		};
    const requestParams = Object.assign({}, defaultParams, params);
    request(requestParams, function(error, response, body) {
  		callback(error, response, body);
  	});
  });
};
