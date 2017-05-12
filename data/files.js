const request = require("request");
const moment = require("moment");
const { syncplicityRequest } = require("./request.js");

let getParameters = function(queryString, ...parameters) {
  const regexp = /\d+?\D/g;//all digets
  let result = [];
  for(let i = 0; i < parameters.length; i++) {
    let pos = queryString.indexOf(parameters[i]);
    if(pos < 0) {
      return new Error("Invalid parameters name or value");
    }
    regexp.lastIndex = pos;
    result.push(regexp.exec(queryString)[0].replace(/\D/g, ''));
  }
  return result;
}

module.exports.getByQuery = function(context, complete, modules) {
  const queryStr = context.query.query.toLowerCase();
  let endpoint;

  try {
    let [syncpoint_id, folder_id] = getParameters(queryStr, 'syncpoint_id', 'folder_id');
    endpoint = `https://api.syncplicity.com/sync/folder_files.svc/${syncpoint_id}/folder/${folder_id}/files`;
  } catch(error) {
    return complete().setBody(error).badRequest().next();
  }

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
