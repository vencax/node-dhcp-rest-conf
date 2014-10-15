var express = require('express')
  , Resource = require('express-resource')
  , bodyParser = require('body-parser')
  , app = express();
var prefix = 'api';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if ('FRONTEND_APP' in process.env) {
  // mount angular frontend -> no need for CORS
  console.log("mounting angular frontend ...");
  app.use(express.static(process.env.FRONTEND_APP));
} else {
  app.use(require('cors')({maxAge: 86400}));
}

var hosts_ctrl = require('./controllers/hosts');
app.resource(prefix + '/dhcphosts', hosts_ctrl);

var hoststate = require('./controllers/state');
app.put('/' + prefix + '/hoststate/:mac', hoststate.wake);
app.get('/' + prefix + '/hoststate/:ip', hoststate.stat);

app.post('/login', function(req, res) {
  res.json({ message: 'logging in!' });
});

exports.app = app;
