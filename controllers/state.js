var exec = require('child_process').exec;

exports.wake = function(req, res, next) {
  var command = 'wakeonlan ' + req.params.mac;
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