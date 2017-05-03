const request = require("request");
const moment = require("moment");
const serverCredentials = require("../serverCredentials.js");

module.exports.getByQuery = function(context, complete, modules) {
  const { syncpoint_id, folder_id } = context.query;

  let isValidValue = (parameter) => {
    return (parameter.match(/^\d+$/) && (parameter > 0)) ? true : false;
  }

  //syncpoint_id or folder_id are not valid
  if((!isValidValue(syncpoint_id)) || (!isValidValue(folder_id))) {
    return complete().setBody(new Error("Invalid parameters value")).badRequest().next();
  }

  const endpoint = `https://api.syncplicity.com/sync/folder_folders.svc/${syncpoint_id}/folder/${folder_id}/folders`;
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
      //syncpoint_id or folder_id are not correct
      if(response.statusCode == 404) {
        return complete()
        .setBody(new Error("Folder could not be found. Please check :syncpoint_id and :folder_id"))
        .notFound()
        .next();
      }

      var responseBody = [];
			body = JSON.parse(body);
			body.forEach(function(folder) {
        var responseFolder = {};
        responseFolder._id = folder.FolderId;
        responseFolder.SyncpointId = folder.SyncpointId;
        responseFolder.Name = folder.Name;
        responseFolder._acl = {};
        responseFolder._kmd = {"ect": moment(), "lmt": moment()};
        responseBody.push(responseFolder);
			})
      return complete(responseBody).setBody().ok().next();
		});
	});
};
