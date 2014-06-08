var koa = require("koa")
	, Router = require('koa-router')
	, mount = require('koa-mount')

// Custom Dropbox library
var Dropbox = require('./lib');

// Iniciar Koa
var app = koa();

var API = new Router();

// GET accountInfo
API.get("/accountInfo", function *() {
	this.body = yield Dropbox.accountInfo();
});

app.use(mount('/dropbox', API.middleware()));

// Listen
app.listen(3000);
