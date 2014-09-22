// DB of hosts as returned from py-dhcpd-manip tool
// Data are cached in object to accelerate the process
// and leases are periodically loaded.

var manip = require('js-wrap-py-dhcpd-manip');

var _db = {};
var _ip_index = {};

var _list = function(){
  var vals = [];
  for(var k in _db){
    vals.push(_db[k]);
  }
  return vals;
};

var _get = function(mac){
  if(mac in _db){
    return _db[mac];
  } else{
    return null;
  }
};

var _add_reserved = function(body) {
  _db[body.mac] = {ip: body.ip, mac: body.mac, name: body.name, res: true};
  _ip_index[body.ip] = _db[body.mac];
};

var _add = function(body, cb){
  // reservation already exists
  if(body.mac in _db && _db[body.mac].res === true){
    return cb('Already exists', body);
  }

  if(body.ip in _ip_index){
    return cb('IP already reserved', body);
  }

  // lease exists -> change lease to reservation = just remove the lease from db
  if(body.mac in _db && _db[body.mac].res === true){
    delete _db[body.mac];
  }

  manip.add(body.name, body.mac, body.ip, function(err, created){
    if(err){
      cb(err, null);
    } else{
      _add_reserved(body);
      cb(null, body);
    }
  });
};

var _remove = function(host, cb){
  manip.remove(host.mac, function(err, removed){
    if(err){
      cb(err, null);
    } else{
      delete _db[host.mac];
      delete _ip_index[host.ip];
      cb(null, removed);
    }
  });
};

var _update = function(host, body, cb){
  _remove(host, function(err, removed){
    if(err){
      return cb(err, null);
    }
    var toCreate = host;
    for(var k in body){
      toCreate[k] = body[k];
    }
    _add(toCreate, cb);
  });
};

module.exports = {
  add: _add,
  remove: _remove,
  list: _list,
  update: _update,
  get: _get
};

// ----------------------- init --------------------------

manip.getreserved(function(err, reserved){
  if(err){
    console.error(err);
  } else{
    for(var h in reserved){
      var body = reserved[h];
      body.mac = h;
      body.res = true;
      _add_reserved(body);
    }
  }
});

var _refresh = function(){
  manip.getleases(function(err, leases){
    if(err){
      console.error(err);
    } else{
      for(var l in leases){
        var info = leases[l];
        if(!(info[0] in _db)){
          _db[info[0]] = {ip: l, mac: info[0], name: info[1], res: false};
        }
      }
    }
  });
};

_refresh();
