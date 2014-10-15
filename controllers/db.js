// DB of hosts as returned from py-dhcpd-manip tool
// Data are cached in object to accelerate the process
// and leases are periodically loaded.

var manip = require('node-py-dhcpd-manip-wrapper');

var _db = {};
var _ip_index = {};
var _name_index = {};

var _hexdigit = [
  'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

var _normalize_mac = function(mac) {
  var validated = [];
  for(var i=0, len=mac.length; i<len; i++) {
    if (_hexdigit.indexOf(mac[i]) >= 0) {
      validated.push(mac[i]);
    }
  }
  return validated.join('');
};

var _list = function(){
  var vals = [];
  for(var k in _db){
    vals.push(_db[k]);
  }
  return vals;
};

var _get = function(mac){
  mac = _normalize_mac(mac);
  if(mac in _db){
    return _db[mac];
  } else{
    return null;
  }
};

var _add_reserved = function(body) {
  _db[body.mac] = {
    ip: body.ip, mac: body.mac, name: body.name,
    desc: body.desc, res: true
  };
  _ip_index[body.ip] = _db[body.mac];
  _name_index[body.name] = _db[body.mac];
  return _db[body.mac];
};

// var _get_free_ip = function() {
//   var first = _ip_index[Object.keys(_ip_index)[0]];
//   var net_part = first.ip.split('.').slice(0, 3).join('.');
//   for (var i=20; i<250; i++) {
//     var ip = net_part + '.' + i;
//     if (! (ip in _ip_index)) {
//       return ip;
//     }
//   }
// };

var _add = function(body, cb){
  body.mac = _normalize_mac(body.mac);

  // reservation already exists
  if(body.mac in _db && _db[body.mac].res === true){
    return cb('MAC Already exists', body);
  }

  //   if (!body.ip) {
  //     body.ip = _get_free_ip();
  //   }

  if(body.ip in _ip_index && _ip_index[body.ip].res === true){
    return cb('IP already reserved', body);
  }

  if(body.name in _name_index && _name_index[body.name].res === true){
    return cb('Name already reserved', body);
  }

  // lease exists -> change lease to reservation = just remove the lease from db
  if(body.mac in _db && _db[body.mac].res === false){
    delete _db[body.mac];
  }

  manip.add(body.name, body.mac, body.ip, body.desc, function(err, created){
    if(err){
      cb(err, null);
    } else{
      var newi = _add_reserved(body);
      cb(null, newi);
    }
  });
};

var _remove = function(host, cb){
  host.mac = _normalize_mac(host.mac);
  manip.remove(host.mac, function(err, removed){
    if(err){
      cb(err, null);
    } else{
      console.log(removed);
      var removed = _db[host.mac];
      removed.res = false;
      // remove the reserved indexes
      delete _db[host.mac];
      delete _ip_index[host.ip];
      delete _name_index[host.name];
      cb(null, removed);
    }
  });
};

var _update = function(host, body, cb){

  if (host.ip !== body.ip && body.ip in _ip_index) {
    return cb('IP already reserved', body);
  }

  if (host.name !== body.name && body.name in _name_index){
    return cb('Name already reserved', body);
  }

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
      body.mac = _normalize_mac(h);
      body.res = true;
      body.desc = body.desc ? body.desc : '';
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
