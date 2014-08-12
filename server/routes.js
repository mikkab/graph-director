/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var MongoClient = require('mongodb').MongoClient
var db;


// open a connection and memoize it
function connect(callback) {
  if (db === undefined) {
    MongoClient.connect('mongodb://127.0.0.1/graph_directors', function(err, _db) {
        if (err) { return callback(err) };
        db = _db;
        callback(null, db);
    });
  } else {
    callback(null, db);
  }
}


module.exports = function(app) {

  app.route('/api/director/:name').get(function(req, res) {
     connect(function(err, db) {
        if (err) throw err;

        db.collection('directors').find({name : req.params.name}).toArray(function(err, results) {
          if (err) throw err;
          res.end(JSON.stringify(results));
        });
    });
  });
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
