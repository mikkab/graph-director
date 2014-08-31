'use strict';

var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;


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
exports.list = function(req, res) {
  MongoClient.connect('mongodb://127.0.0.1:27017/graph_directors', function(err, db) {
      if (err) { return handleError(res, err); }

      var directors = db.collection('directors');
      var filter = req.params.filter; 
      collection.find( {name: '/.*' + filter + '/.*' }, {_id: 0, name: 1}, function(err, directors) {

        if (err) { return handleError(res, err); }
        return res.json(_.pluck(directors, 'name'));
      });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

function connect() {
}
