var exec = require('child_process').exec;
var util = require('./util');
var db = require('../db');

var wakePingInterval = process.env.WAKEWAITINTERVAL || 10000;
var maxWakeWait = process.env.MAXWAKEWAIT || 120 * 1000; // 2 mins


exports.wake = function(req, res, next) {
  var m = util.normalize_mac(req.params.mac)
  var command = 'wakeonlan ' + util.colon_mac(m);
  var waited = 0;
  var ip = db.getIP(m);
  if(! ip) { return res.status(404).send('MAC NOT FOUND'); }

  function _onTimer() {
    waited += wakePingInterval;
    _getStatus(ip, function(err, stat) {
      if (err) { return res.status(400).send(err); }
      if(stat == 1 || waited > maxWakeWait) {
        res.json(stat);
      } else {
        setTimeout(_onTimer, wakePingInterval);
      }
    })
  }

  exec(command, function (err, stdout, stderr) {
    if (err) {
      res.status(400).send(stderr);
    } else {
      setTimeout(_onTimer, wakePingInterval)
    }
  });
};

exports.stat = function(req, res, next) {
  var ip = db.getIP(req.params.mac);
  if(! ip) { return res.status(404).send('MAC NOT FOUND'); }
  _getStatus(ip, function (err, out) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(out);
    }
  });
};

function _getStatus(ip, cb) {
  var command = "ping -c 1 " + ip;
  exec(command, function (err, stdout, stderr) {
    if (err) { return cb(err); }
    if (stdout.indexOf('1 received') < 0) {
      cb(null, 0);
    } else {
      cb(null, 1);
    }
  });
}
