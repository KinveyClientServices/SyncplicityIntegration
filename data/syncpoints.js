const request = require("request");
const moment = require("moment");
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

			var responseBody = []
			body = JSON.parse(body);
			body.forEach(function(syncpoint) {
				var responseSyncpoint = {};
				responseSyncpoint._id = syncpoint.Id;
				responseSyncpoint.Type = syncpoint.Type;
				responseSyncpoint.Name = syncpoint.Name;
				responseSyncpoint.RootFolderId = syncpoint.RootFolderId;
				responseSyncpoint._acl = {};
				responseSyncpoint._kmd = {"ect": moment(), "lmt": moment()};
				responseBody.push(responseSyncpoint);
			})
			return complete().setBody(responseBody).ok().next();
		});
	})
};
