var exec = require('child_process').exec;
var util = require('./util');

exports.wake = function(req, res, next) {
  var m = util.colon_mac(util.normalize_mac(req.params.mac))
  var command = 'wakeonlan ' + m;
  exec(command, function (err, stdout, stderr) {
    res.status(200).end();
  });
};

exports.stat = function(req, res, next) {
  var command = 'ping ' + req.params.ip;
  exec(command, function (err, stdout, stderr) {
    res.status(200).end();
  });
};
