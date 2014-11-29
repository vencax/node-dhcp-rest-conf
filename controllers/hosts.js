var db = require('node-py-dhcpd-manip-wrapper');

exports.index = function(req, res) {
  db.list(function(err, list) {
    res.send(list).end();
  });
};

exports.create = function(req, res, next){
  if(!req.body.name || !req.body.mac || !req.body.ip) {
    return res.status(400).send('missing required param: name, mac, ip');
  }
  db.add(req.body, function(err, created){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.status(201).send(created);
    }
  });
};

exports.show = function(req, res){
  // return already found (loaded) host
  res.send(req.dhcphost).end();
};

exports.update = function(req, res){
  db.update(req.dhcphost.mac, req.body, function(err, updated){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.send(updated);
    }
  });
};

exports.destroy = function(req, res){
  db.remove(req.dhcphost.mac, function(err, removed){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.send(removed);
    }
  });
};

// actual object loading function (loads based on req url params)
exports.load = function(id, fn){
  db.get(id, fn);
};
