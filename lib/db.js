
// DB of hosts as returned from py-dhcpd-manip tool
// Data are cached in object to accelerate the process
// and leases are periodically loaded.

var manip = require('./pydhcpdmanip');
var util = require('./controllers/util');

var _db = {};
var _ip_index = {};
var _name_index = {};

function _remove_from_idx(host, netPart) {
  delete _db[host.mac];
  delete _name_index[host.name];
  delete _ip_index[netPart][host.ip];
}

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

exports.getIP = function(mac) {
  mac = util.normalize_mac(mac);
  for(var netPart in _ip_index) {
    for(var ip in _ip_index[netPart]) {
      if(_ip_index[netPart][ip].mac === mac) {
        return netPart.split('-').join('.') + '.' + ip;
      }
    }
  }
  return null;
}

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

function _validate(body, netPart) {

  // reservation already exists
  if(body.mac && body.mac in _db && _db[body.mac].res === true) {
    return 'MAC Already reserved';
  }

  if(body.name && body.name in _name_index
      && _name_index[body.name].res === true) {
    return 'Name already reserved';
  }

  if(body.ip) {
    if(! (netPart in _ip_index)) { _ip_index[netPart] = {}; }

    if(body.ip in _ip_index[netPart] &&
      _ip_index[netPart][body.ip].res === true) {
      return 'IP already reserved';
    }
  }
}

exports.add = add = function(body, netPart, cb) {
  body.mac = util.normalize_mac(body.mac);

  var err = _validate(body, netPart, cb);
  if(err) { return cb(err, null); }

  //   if (!body.ip) {
  //     body.ip = _get_free_ip();
  //   }
  var iidx = _ip_index[netPart];

  if(body.ip in iidx && iidx[body.ip].res === true) {
    return cb('IP already reserved', body);
  }

  // lease exists -> remove it
  if( (body.mac in _db && _db[body.mac].res === false) ||
      (body.name in _name_index && _name_index[body.name].res === false) ||
      (body.ip in iidx && iidx[body.ip].res === false) ) {
    _remove_from_idx(body, netPart);
  }

  var ip = netPart.split('-').join('.') + '.' + body.ip;
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
    if(err) {
      cb(err, null);
    } else {
      var removed = _db[host.mac];
      removed.res = false;
      _remove_from_idx(host, netPart);
      cb(null, removed);
    }
  });
};

exports.update = function(host, update, netPart, cb) {
  for(var c in update) {
    if(host[c] && host[c] === update[c]) { delete update[c]; }
  }
  var err = _validate(update, netPart);
  if(err) { return cb(err, null); }

  function _updt(updated) {
    for(var key in update) {
      updated[key] = update[key];
    }
    add(updated, netPart, cb);
  }

  if(host.res) {
    remove(host, netPart, function(err, removed) {
      if(err) { return cb(err, null); }
      _updt(host);
    });
  } else {
    _remove_from_idx(host, netPart);
    _updt(host);
  }

}

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
      var netPart = ipparts.slice(0, 3).join('-');
      body.ip = parseInt(ipparts[3], 10);
      if(! (netPart in _ip_index)) { _ip_index[netPart] = {}; }
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
        var ipparts = l.split('.');
        var netPart = ipparts.slice(0, 3).join('-');
        host = {
          ip: parseInt(ipparts[3], 10),
          mac: mac, name: info[1], res: false
        }
        if(!(mac in _db)) {
          _db[mac] = host;
          if(! (netPart in _ip_index)) { _ip_index[netPart] = {}; }
          _ip_index[netPart][host.ip] = host;
        }
      }
    }
  });
};

_refresh();
