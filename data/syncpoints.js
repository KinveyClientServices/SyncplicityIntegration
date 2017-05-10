const request = require("request");
const moment = require("moment");
const { syncplicityRequest } = require("./request.js");

module.exports.getAll = function(context, complete, modules) {
	const endpoint = "https://api.syncplicity.com/syncpoint/syncpoints.svc/";
	const requestParams = {
		"method": "GET",
		"uri": endpoint
	};
	syncplicityRequest(requestParams, function(error, response, body) {
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
};
