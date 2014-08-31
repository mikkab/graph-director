/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var MongoClient = require('mongodb').MongoClient
var _ = require('lodash');
var db;


// open a connection and memoize it
function connect(callback) {
  if (db === undefined) {
    MongoClient.connect('mongodb://asafdav2:28578@kahana.mongohq.com:10060/app28168427', function(err, _db) {
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

  app.route('/api/directors').get(function(req, res) {
     connect(function(err, db) {
        if (err) throw err;
        var filter = req.query.filter || '';
        if (filter.length < 2)
          filter = '';

        db.collection('directors').find({name: {$regex : filter}}, {_id : 0, name : 1}).sort({name : 1}).toArray(function(err, results) {
          if (err) throw err;
          var names = _.pluck(results, 'name');
          res.end(JSON.stringify(names));
        });
    });
  });

  app.route('/api/directors/top').get(function(req, res) {
     connect(function(err, db) {
        if (err) throw err;

        var limit = req.params.limit ? parseInt(req.params.limit) : 200;
        db.collection('directors').find({}, {_id : 0, name : 1, average : 1}, {limit: limit}).sort({average : -1}).toArray(function(err, results) {
          if (err) throw err;
          var names = _.pluck(results, 'name');
          res.end(JSON.stringify(names));
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
