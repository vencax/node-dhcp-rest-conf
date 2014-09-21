var express = require('express')
  , Resource = require('express-resource')
  , bodyParser = require('body-parser')
  , app = express();

app.use(bodyParser.urlencoded({ extended: false }));

var hosts_ctrl = require('./controllers/hosts');
app.resource('dhcphosts', hosts_ctrl);

exports.app = app;