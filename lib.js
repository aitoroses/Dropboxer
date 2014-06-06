var co = require("co"),
	thunkify = require("thunkify"),
	Dropbox = require("dropbox");

var token = "gTwwMn7WAaoAAAAAAAAR5GYZDabJaQQD0SEnmxmQsc8Civ2GMBc_sttOfqJygpnc";

var client = new Dropbox.Client({
    token: token
});

function C(callback) {
	return function(error, data) {
		if (error) {
			return callback(error);  // Something went wrong.
		}
		callback(null, data);
	};
}

function accountInfo(callback) {
	client.getAccountInfo(C(callback));
}

exports.accountInfo = thunkify(accountInfo);