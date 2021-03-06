var express = require('express')
  , Resource = require('express-resource');

// create API app -------------------------------------------------------------

var api = module.exports = express();

api.resource('dhcphosts/:net', require('./controllers/hosts'));

var hoststate = require('./controllers/state');
api.put('/hoststate/:mac', hoststate.wake);
api.get('/hoststate/:mac', hoststate.stat);
