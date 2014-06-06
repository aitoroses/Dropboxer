var koa = require("koa"),
	Dropbox = require('./lib');

// Iniciar Koa
var app = koa();

// Basic Middleware with generator
app.use(function* () {
	this.body = yield Dropbox.accountInfo();
});

// Listen
app.listen(3000);
