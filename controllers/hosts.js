var db = require('./db');

exports.index = function(req, res){
  res.send(db.list()).end();
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
  db.update(req.dhcphost, req.body, function(err, updated){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.send(updated);
    }
  });
};

exports.destroy = function(req, res){
  db.remove(req.dhcphost, function(err, removed){
    if(err){
      return res.status(400).send(err);
    } else{
      return res.send(removed);
    }
  });
};

// actual object loading function (loads based on req url params)
exports.load = function(id, fn){
  var found = db.get(id);
  if(found){
    fn(null, found);
  } else {
    fn(null, null);
  }
};