'use strict';

var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var NodeCache = require('node-cache');
var _ = require('lodash');
var db;

var cache = new NodeCache();

// Get a single director
exports.show = function(req, res) {
  console.log('in show');
  MongoClient.connect('mongodb://127.0.0.1:27017/graph_directors', function(err, db) {
      if (err) { return handleError(res, err); }

      var directors = db.collection('directors');
      collection.find( {'name' : req.params.name}, function(err, director) {

        if (err) { return handleError(res, err); }
        if (!director) { return res.send(404); }
        return res.json(director);
      });
  });
};

// Get director names
exports.get_director = function(req, res) {
    var name = req.params.name;
    var key = name;
    cache.get(key, function(err, value) {
      if (err) throw err;

      if (!_.isEmpty(value)) {
        res.end(value[key]);
      } else {
        connect(function(err, db) {
          if (err) throw err;
          db.collection('directors').find({name : name}).toArray(function(err, results) {
            if (err) throw err;
            var json = JSON.stringify(results);
            cache.set(key, json);
            res.end(json);
          });
        });
      }
    });
};

exports.invalidate_director = function(req, res) {
  var name = req.params.name;
  var key = name;
  res.end(cache.del(key));
}

exports.get_directors = function(req, res) {
  var key = '_directors_';
  cache.get(key, function(err, value) {
    if (err) throw err;

    if (!_.isEmpty(value)) {
      res.end(value[key]);
    } else {
      connect(function(err, db) {
        if (err) throw err;
        var filter = req.query.filter || '';
        if (filter.length < 2)
          filter = '';

        db.collection('directors').find({name: {$regex : filter}}, {_id : 0, name : 1}).sort({name : 1}).toArray(function(err, results) {
          if (err) throw err;
          var names = _.pluck(results, 'name');
          var json = JSON.stringify(names);
          cache.set(key, json);
          res.end(json);
        });
      });
    }
  });
}

exports.invalidate_directors = function(req, res) {
  var key = '_directors_';
  res.end(cache.del(key));
}

exports.get_top_directors = function(req, res) {
  var key = '_top_';
  cache.get(key, function(err, value) {
    if (err) throw err;

    if (!_.isEmpty(value)) {
      res.end(value[key]);
    } else {
      connect(function(err, db) {
        if (err) throw err;

        var limit = req.params.limit ? parseInt(req.params.limit) : 200;
        db.collection('directors').find({}, {_id : 0, name : 1, average : 1}, {limit: limit}).sort({average : -1}).toArray(function(err, results) {
          if (err) throw err;
          var names = _.pluck(results, 'name');
          var json = JSON.stringify(names);
          cache.set(key, json);
          res.end(json);
        });
      });
    }
  });
}

exports.invalidate_top_directors = function(req, res) {
  var key = '_top_';
  res.end(cache.del(key));
}

function handleError(res, err) {
  return res.send(500, err);
}

// open a connection and memoize it
function connect(callback) {
  if (db === undefined) {
    MongoClient.connect(process.env.MONGOHQ_URL, function(err, _db) {
        if (err) { return callback(err); }
        db = _db;
        callback(null, db);
    });
  } else {
    callback(null, db);
  }
}
