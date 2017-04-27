const request = require("request");

const endpoint = "https://api.syncplicity.com/oauth/token"

module.exports.authenticate = function(callback) {
	request({
		"method": "POST",
		"uri": endpoint,
		"headers": {
			"Sync-App-Token": "Yn+Miw8OITEfImNah3Yr8Mm+EBzbFe+jlpxOyTxI+6ls2jPT9fL1D2p21HUNr+bs",
			"Authorization": "Basic bDVHQzRQVFUxR0FnWTNmR3drZktYUDR2dGpZS0ZPVVo6dlZydlNKd09qUk1DM25IZA=="
		},
		"form": {
			"grant_type": "client_credentials"
		}
	}, function(error, response) {
		if(error) {
			console.log("Something bad happened: " + JSON.stringify(error));
			callback(error);
		}

		console.log("Got a result");
		const body = JSON.parse(response.body);
		callback(null, body.access_token);
	});
};
