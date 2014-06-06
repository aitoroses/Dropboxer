/* global require */
var co = require("co"),
	thunkify = require("thunkify"),
	koa = require("koa"),
	Dropbox = require("dropbox");

var token = "gTwwMn7WAaoAAAAAAAAR5GYZDabJaQQD0SEnmxmQsc8Civ2GMBc_sttOfqJygpnc";

var client = new Dropbox.Client({
    token: token
});

var getAccountInfo = thunkify(client.getAccountInfo);

var koa = require('koa');
var app = koa();

app.use(function* () {
  var context = this;
  co(function* () {
	//handler.call(context);
	var a = getAccountInfo();
	yield a
  })();
});

app.listen(3000);

// Handler

// function handler() {
// 	// getAccountInfo()(function(err, info){
// 	// 	console.log(err)
// 	// 	this.body = info;
// 	// }.bind(this));

// 	// var context = this;
// 	// client.getAccountInfo(function(error, accountInfo) {
// 	//   if (error) {
// 	//     return showError(error);  // Something went wrong.
// 	//   }

// 	//   console.log("Hello, " + accountInfo.name + "!");
// 	// });

// 	function* getAccount() {

// 		 yield client.getAccountInfo()
// 	}

// 	var gen = getAccount();

// 	console.log(gen.getNext());

	
// }
