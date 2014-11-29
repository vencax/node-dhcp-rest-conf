var db = require('node-py-dhcpd-manip-wrapper');
var util = require('./util');

exports.wake = function(req, res, next) {
  db.wake(req.params.mac, function(err, stat) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(stat);
    }
  });
};

exports.stat = function(req, res, next) {
  db.stat(req.params.ip, function(err, stat) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(stat);
    }
  });
};
