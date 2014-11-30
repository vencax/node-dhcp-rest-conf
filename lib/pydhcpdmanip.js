
var exec = require('child_process').exec;
var prog = 'dhcpdmanip_cli.py';
var reload = process.env.RELOAD_DHCPD || 'service isc-dhcp-server restart';

exports.add = function(name, mac, ip, desc, cb) {
  var command = prog + ' add --mac=' + mac + ' --host=' + name;
  command = command + ' --ip=' + ip;
  if (desc) {
    command = command + ' --desc="' + desc + '"';
  }
  exec(command, function (err, stdout, stderr) {
    if(err !== null) {
      return cb(stderr, null);
    }
    cb(null, stdout);
  });
  exec(reload);
};

var _bad_result = 'Wrong result from dhcpdmanip_cli.py. Broken? : '

exports.remove = function(mac, cb) {
  exec(prog + ' remove --mac=' + mac, function (err, stdout, stderr) {
    if(err !== null) {
      return cb(stderr, null);
    }
    cb(null, stdout);
  });
  exec(reload);
};

exports.getleases = function(cb) {
  exec(prog + ' getleases', function (err, stdout, stderr) {
    if(err !== null) {
      return cb(stderr, null);
    }
    try {
      cb(null, JSON.parse(stdout));
    } catch(e) {
      cb(_bad_result, null);
    }
  });
};

exports.getreserved = function(cb) {
  exec(prog + ' getreserved', function (err, stdout, stderr) {
    if(err !== null) {
      return cb(stderr, null);
    }
    try {
      cb(null, JSON.parse(stdout));
    } catch(e) {
      cb(_bad_result + e, null);
    }
  });
};
