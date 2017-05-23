const request = require("request");
const moment = require("moment");
const { syncplicityRequest } = require("./request.js");

let getParameters = function(queryString, ...parameters) {
  const regexp = /\d+?\D/g;//all digets
  let result = [];
  for(let i = 0; i < parameters.length; i++) {
    let pos = queryString.indexOf(parameters[i]);
    if(pos < 0) {
      throw new Error("Invalid parameters name or value");
    }
    regexp.lastIndex = pos;
    result.push(regexp.exec(queryString)[0].replace(/\D/g, ''));
  }
  return result;
}

const getByQuery = function(context, complete, modules) {
  const queryStr = context.query.query;
  let endpoint;

  try {
    let [SyncpointId, FolderId] = getParameters(queryStr, 'SyncpointId', 'FolderId');
    endpoint = `https://api.syncplicity.com/sync/folder_files.svc/${SyncpointId}/folder/${FolderId}/files`;
  } catch(error) {
    const errorMessage = `Error:
      method: ${context.method}
      query: ${queryStr}`;
      console.log(errorMessage);
    return complete()
      .setBody(new Error(errorMessage))
      .badRequest().next();
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
    //SyncpointId or FolderId are not correct
    if(response.statusCode == 404) {
      return complete()
      .setBody(new Error("Folder could not be found. Please check :SyncpointId and :FolderId"))
      .notFound()
      .next();
    }

    var responseBody = [];
    body = JSON.parse(body);
    body.forEach(function(file) {
      var responseFile = {};
      responseFile._id = file.FileId.toString();
      responseFile.FileId = file.FileId;
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

const deleteByQuery = function(context, complete, modules) {
  const queryStr = context.query.query;
  console.log(queryStr);
  let endpoint;

  try {
    let [SyncpointId, LatestVersionId] = getParameters(queryStr, 'SyncpointId', 'LatestVersionId');
    endpoint = `https://api.syncplicity.com/sync/file.svc/${SyncpointId}/file/${LatestVersionId}`
  } catch(error) {
    const errorMessage = `Error:
      method: ${context.method}
      query: ${queryStr}`;
      console.log(errorMessage);
    return complete()
      .setBody(new Error(errorMessage))
      .badRequest().next();
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
    console.log(response.statusCode);
    //SyncpointId or LatestVersionId are not correct
    if(parseInt(response.statusCode/100) == 4) {
      return complete()
      .setBody(body)
      .badRequest()
      .next();
    }

    return complete().setBody(JSON.stringify({count: 1})).ok().next();
  });
};

module.exports.getByQuery = getByQuery;
module.exports.deleteByQuery = deleteByQuery;
