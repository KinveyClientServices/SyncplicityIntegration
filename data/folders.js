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

const getByQuery = function(context, complete, modules) {
  const queryStr = context.query.query.toLowerCase();
  let endpoint;

  try {
    let [syncpoint_id, folder_id] = getParameters(queryStr, 'syncpoint_id', 'folder_id');
    endpoint = `https://api.syncplicity.com/sync/folder_folders.svc/${syncpoint_id}/folder/${folder_id}/folders`;
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
};

const deleteByQuery = function(context, complete, modules) {
  const queryStr = context.query.query.toLowerCase();
  let endpoint;

  try {
    let [syncpoint_id, folder_id] = getParameters(queryStr, 'syncpoint_id', 'folder_id');
    endpoint = `https://api.syncplicity.com/sync/folder.svc/${syncpoint_id}/folder/${folder_id}`
  } catch(error) {
    return complete().setBody(error).badRequest().next();
  }

  const requestParams = {
    "method": "DELETE",
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
      .setBody(new Error("Syncpoint could not be found. Please check :syncpoint_id"))
      .notFound()
      .next();
    }

    return complete().ok().next();
  });
};

module.exports.getByQuery = getByQuery;
module.exports.deleteByQuery = deleteByQuery;
