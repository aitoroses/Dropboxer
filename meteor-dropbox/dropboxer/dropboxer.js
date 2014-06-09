
Dropboxer = {};

/** Meteor collection for dropboxer */
Dropboxer.collection = new Meteor.Collection('images');

var _col = Dropboxer.collection;

var host = 'localhost';
var port = 3100;

function defaultResponse(next) {
    return function(err, res) {
        if (err) return next(err);
        return next(err, res.content);
    };
}

if (Meteor.isServer) {
    var Fiber = Meteor.require("fibers");
    var Future = Meteor.require("fibers/future");

    Meteor.methods({
        /** Return the list of files in the preconfigured folder */
        'dropboxer-list': function() {
            var uri = 'http://' + host + ':' + port + '/dropbox/list';
            return HTTP.get(uri);
        },
        'dropboxer-file': function(name) {
            var uri = 'http://' + host + ':' + port + '/dropbox/file/' + name;
            var image = HTTP.get(uri);
            var imageObj = {
                filename: name,
                data: image.content,
                mime: image.headers['content-type'],
                created_at: new Date
            };
            _col.insert(imageObj);
            return imageObj;
        },
        'dropboxer-sync-db': function() {
            // Synchronize dropbox with mongodb collection
            var uri = 'http://' + host + ':' + port + '/dropbox/list';
            var list = JSON.parse(HTTP.get(uri).content);

            // cleanup collection
            _col.remove({});

            // Syncronize images
            var images = list.filter(function(name) {
                var extension = name.split('.')[1];
                if (extension == 'jpg' || extension == 'png') return name;
            });
            // Sync now
            var now = new Date();
            /*images.map(function(image) {
                // Make an HTTP request for each file in the list
                console.log(image, ' - ', new Date - now + 'ms');
                return Meteor.call('dropboxer-file', [image]);
            });*/
            var futures = images.map(function(image){
                // Setup a future for the current job
                var future = new Future();

                // A callback so the job can signal completion
                var onComplete = future.resolver();

                // Make the async job
                console.log(image, ' - ', new Date - now + 'ms');
                var uri = 'http://' + host + ':' + port + '/dropbox/file/' + image;
                Meteor.http.get(uri, function(err, res){
                    var imageObj = {
                        filename: image,
                        data: res.content,
                        mime: res.headers['content-type'],
                        created_at: new Date
                    };
                    _col.insert(imageObj);
                    onComplete(err, imageObj);
                });

                // Return the future
                return future;
            });

            Future.wait(futures);

            return new Date - now + 'ms';
        }
    });
}

if (Meteor.isClient) {

    /** Client method to retrieve the list
     * @param {Function} callback that returns the result
     */
    Dropboxer.list = function(callback) {
        Meteor.call('dropboxer-list', defaultResponse(callback));
    };

    /** Client method to get a file
     * @param {String} name is the name of the file.
     * @param {Function} callback that returns the result
     */
    Dropboxer.file = function(name, callback) {
        Meteor.call('dropboxer-file', [name], function(err, res) {
            if (err) return callback(err);
            callback(null, res.content);
        });
    };

    /** Client method to get a file
     * @param {Function} callback that returns the result
     */
    Dropboxer.sync = function(callback) {
        Meteor.call('dropboxer-sync-db', function(err, res) {
            if (err) return callback(err);
            callback(null, res);
        });
    };
}
