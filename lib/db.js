
// DB of hosts as returned from py-dhcpd-manip tool
// Data are cached in object to accelerate the process
// and leases are periodically loaded.

var manip = require('./pydhcpdmanip');
var util = require('./controllers/util');

var _db = {};
var _ip_index = {};
var _name_index = {};

exports.list = function(netPart) {
  var vals = [];
  for(var k in (_ip_index[netPart] || [])) {
    vals.push(_ip_index[netPart][k]);
  }
  return vals;
};

exports.get = get = function(mac) {
  mac = util.normalize_mac(mac);
  if(mac in _db){
    return _db[mac];
  } else{
    return null;
  }
};

var _add_reserved = function(body, netPart) {
  _db[body.mac] = {
    ip: body.ip, mac: body.mac, name: body.name,
    desc: body.desc, res: true
  };
  _ip_index[netPart][body.ip] = _db[body.mac];
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

exports.add = add = function(body, netPart, cb) {
  body.mac = util.normalize_mac(body.mac);

  // reservation already exists
  if(body.mac in _db && _db[body.mac].res === true) {
    return cb('MAC Already exists', body);
  }

  if(! (netPart in _ip_index)) { _ip_index[netPart] = {}; }

  //   if (!body.ip) {
  //     body.ip = _get_free_ip();
  //   }

  if(body.ip in _ip_index[netPart] && _ip_index[netPart][body.ip].res === true) {
    return cb('IP already reserved', body);
  }

  if(body.name in _name_index && _name_index[body.name].res === true) {
    return cb('Name already reserved', body);
  }

  // lease exists -> change lease to reservation = just remove the lease from db
  if(body.mac in _db && _db[body.mac].res === false) {
    delete _db[body.mac];
  }

  var ip = netPart + '.' + body.ip;
  manip.add(body.name, body.mac, ip, body.desc, function(err, created) {
    if(err){
      cb(err, null);
    } else{
      var newi = _add_reserved(body, netPart);
      cb(null, newi);
    }
  });
};

exports.remove = remove = function(host, netPart, cb) {
  mac = util.normalize_mac(host.mac);
  manip.remove(host.mac, function(err, removed){
    if(err){
      cb(err, null);
    } else{
      var removed = _db[host.mac];
      removed.res = false;
      // remove the reserved indexes
      delete _db[host.mac];
      delete _ip_index[netPart][host.ip];
      delete _name_index[host.name];
      cb(null, removed);
    }
  });
};

exports.update = function(orig, update, netPart, cb) {
  remove(orig, netPart, function(err, removed) {
    if(err) { return cb(err, null); }
    for(var key in update) {
      removed[key] = update[key];
    }
    add(removed, netPart, cb);
  });
}

var _update = function(host, body, cb) {

  if (host.ip !== body.ip && body.ip in _ip_index) {
    return cb('IP already reserved', body);
  }

  if (host.name !== body.name && body.name in _name_index) {
    return cb('Name already reserved', body);
  }

  _remove(host, function(err, removed) {
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

// ----------------------- init --------------------------

manip.getreserved(function(err, reserved) {
  if(err){
    console.error(err);
  } else{
    for(var h in reserved){
      var body = reserved[h];
      body.mac = util.normalize_mac(h);
      body.res = true;
      body.desc = body.desc ? body.desc : '';
      var ipparts = body.ip.split('.');
      var netPart = ipparts[3];
      body.ip = ipparts.slice(3);
      _add_reserved(body, netPart);
    }
  }
});

var _refresh = function() {
  manip.getleases(function(err, leases) {
    if(err) {
      console.error(err);
    } else{
      for(var l in leases) {
        var info = leases[l];
        mac = util.normalize_mac(info[0]);
        if(!(mac in _db)) {
          _db[mac] = {ip: l, mac: mac, name: info[1], res: false};
        }
      }
    }
  });
};

_refresh();
