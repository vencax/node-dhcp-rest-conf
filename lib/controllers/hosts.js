
var db = require('../db');

exports.index = function(req, res) {
  res.json(db.list(req.params.net));
};

exports.create = function(req, res, next){
  if(!req.body.name || !req.body.mac || !req.body.ip) {
    return res.status(400).send('missing required param: name, mac, ip');
  }
  req.body.ip = parseInt(req.body.ip, 10);
  db.add(req.body, req.params.net, function(err, created){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.status(201).json(created);
    }
  });
};

exports.show = function(req, res){
  // return already found (loaded) host
  res.json(req.dhcphost);
};

exports.update = function(req, res) {
  if(req.body.ip) { req.body.ip = parseInt(req.body.ip, 10); }
  db.update(req.dhcphost, req.body, req.params.net, function(err, updated){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.send(updated);
    }
  });
};

exports.destroy = function(req, res){
  db.remove(req.dhcphost, req.params.net, function(err, removed){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.json(removed);
    }
  });
};

exports.id = 'dhcphost'

// actual object loading function (loads based on req url params)
exports.load = function(req, id, fn) {
  var found = db.get(id);
  if(found) {
    fn(null, found);
  } else {
    fn(null, null);
  }
};
