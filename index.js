var fs = require('fs');
var thunkify = require('thunkify');
var fsstat = thunkify(fs.stat);
var fsWriteFile = thunkify(fs.writeFile);
var fsReadFile = thunkify(fs.readFile);

var koa = require('koa'),
    Router = require('koa-router'),
    mount = require('koa-mount');

// Custom Dropbox library
var Dropbox = require('./lib');

// Iniciar Koa
var app = koa();

/* Logger */
app.use(function *(next) {
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms + 'ms');
});

var API = new Router();

// GET accountInfo
API.get('/accountInfo', function *() {
    this.body = yield Dropbox.accountInfo();
});

// GET Dir list
API.get('/list', function *() {
    this.body = yield Dropbox.readdir('/');
});

// GET File stat
API.get('/stat', function *() {
    this.body = yield Dropbox.stat('zrc_cs.jpg');
});

// GET File API
API.get('/file/:filename', function *() {

    var filename = this.params['filename'],
        mimeType = 'image/jpeg';

    // path
    var path = __dirname + '/cache/' + filename;

    // Read from cache
    try {
        var fileStat = yield fsstat(path);
        var file = yield fsReadFile(path);
        if (file == null) {throw new Error('Not file found.')}
        this.body = new Buffer(file, 'binary').toString('base64');
    } catch (e) {
        // It's not present in cache, so load from Dropbox and cache the file
        try {
            var stat = yield Dropbox.stat(filename);
            mimeType = stat.mimeType;
        } catch (e) {
            this.body = e; return;
        }
        var dfile = yield Dropbox.readFile(filename);
        yield fsWriteFile(path, dfile);
        this.body = new Buffer(dfile, 'binary').toString('base64');
    }

    // Set headers
    this.set('Content-Length', this.body.length);
    this.set('Content-Type', mimeType);
    this.set('Content-Disposition', 'attachment; filename=' + filename);

});

// GET Benchmark
API.get('/benchmark', function *() {
    var photos =
        [
            'Foto 05-04-14 22 04 48.jpg',
            'Foto 05-04-14 22 06 44.jpg',
            'Foto 11-05-14 21 48 39.jpg',
            'Foto 17-01-14 20 20 57.jpg'
        ];
    photos = photos.concat(photos);
    photos = photos.concat(photos);
    photos = photos.concat(photos);

    // Iteration using a for, sync yield - 85s
    /* for (var i = 0; i < photos.length; i++) {
        var name = photos[i];
        console.log(name, i);
        yield Dropbox.readFile(name);
    } */

    // Iteration using a map, async yield - 11s
    var result = yield photos.map(function(name) {
        return Dropbox.readFile(name);
    });

    for (var i = 0; i < result.length; i++) {
        console.log(photos[i], result[i].slice(0, 20));
    }

    this.body = 'Done. Look console';
});

app.use(mount('/dropbox', API.middleware()));

// Listen
app.listen(3100);
