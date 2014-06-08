var thunkify = require("thunkify"),
	Dropbox = require("dropbox");

var token = "gTwwMn7WAaoAAAAAAAAR5GYZDabJaQQD0SEnmxmQsc8Civ2GMBc_sttOfqJygpnc";
var client = new Dropbox.Client({
    token: token
});

// Default Callback function
function C(callback) {
	return function(error, data) {
		if (error) {
			return callback(error);  // Something went wrong.
		}
		callback(null, data);
	};
}

// AccountInfo API thunk
function accountInfo(callback) {
	client.getAccountInfo(C(callback));
}
exports.accountInfo = thunkify(accountInfo);

// API for read a directory
function readdir(dir, callback) {
	client.readdir(dir, C(callback));
}
exports.readdir = thunkify(readdir);