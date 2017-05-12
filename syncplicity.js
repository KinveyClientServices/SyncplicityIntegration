const sdk = require("kinvey-flex-sdk");
const syncpointsIntegration = require("./data/syncpoints.js");
const foldersIntegration = require("./data/folders.js");
const filesIntegration = require("./data/files.js");
const serverCredentials = require("./serverCredentials.js");

const service = sdk.service(function(err, flex) {
	console.log("started service: " + JSON.stringify(flex));
	const flexAuth = flex.auth;
	const flexData = flex.data;
	const flexFunctions = flex.functions;

	const syncpoints = flexData.serviceObject("Syncpoints");
	syncpoints.onGetAll(syncpointsIntegration.getAll);
	syncpoints.onGetByQuery(syncpointsIntegration.getByQuery);
	syncpoints.onGetById(syncpointsIntegration.getById);
	syncpoints.onGetCount(syncpointsIntegration.getCount);
	syncpoints.onGetCountByQuery(syncpointsIntegration.getCountQuery);

	const folders = flexData.serviceObject("Folders");
	folders.onGetByQuery(foldersIntegration.getByQuery);
	folders.onDeleteByQuery(foldersIntegration.deleteByQuery);

	const files = flexData.serviceObject("Files");
	files.onGetByQuery(filesIntegration.getByQuery);
});
