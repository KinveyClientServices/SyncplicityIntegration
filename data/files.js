const request = require("request");
const moment = require("moment");
const { syncplicityRequest } = require("./request.js");

const isValidValues = (syncpointId, folderId) => {
  if((typeof syncpointId === 'undefined') || (typeof folderId === 'undefined')) {
    return false;
  }
  if(!(syncpointId.match(/^\d+$/)) || !(folderId.match(/^\d+$/))) {
    return false;
  }
  return ((syncpointId > 0) && (folderId > 0)) ? true : false;
}

module.exports.getByQuery = function(context, complete, modules) {
  const { syncpoint_id, folder_id } = context.query;

  //syncpoint_id or folder_id are not valid
  if(!isValidValues(syncpoint_id, folder_id)) {
    return complete().setBody(new Error("Invalid parameters name or value")).badRequest().next();
  }

  const endpoint = `https://api.syncplicity.com/sync/folder_files.svc/${syncpoint_id}/folder/${folder_id}/files`;
  const requestParams = {
    "method": "GET",
    "uri": endpoint
  };
  syncplicityRequest(requestParams, function(error, response, body) {
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
    body.forEach(function(file) {
      var responseFile = {};
      responseFile._id = file.FileId;
      responseFile.SyncpointId = file.SyncpointId;
      responseFile.Filename = file.Filename;
      responseFile.LatestVersionId = file.LatestVersionId;
      responseFile._acl = {};
      responseFile._kmd = {"ect": moment(), "lmt": moment()};
      responseBody.push(responseFile);
    })
    return complete(responseBody).setBody().ok().next();
  });
};
