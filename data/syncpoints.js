const request = require("request");
const serverCredentials = require("../serverCredentials.js");

const endpoint = "https://api.syncplicity.com/syncpoint/syncpoints.svc/"

module.exports.getAll = function(context, complete, modules) {
	serverCredentials.authenticate(function(error, accessToken) {
		request({
			"method": "GET",
			"uri": endpoint,
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"Appkey": "l5GC4PTU1GAgY3fGwkfKXP4vtjYKFOUZ",
				"Authorization": "Bearer " + accessToken
			}
		}, function(error, response, body) {
			if(error) {
				console.log("Something bad happened: " + JSON.stringify(error));
				return complete().setBody(error).runtimeError().next();
			}

			console.log("Got a result");
			return complete().setBody(body).ok().next();
		});
	})
};
