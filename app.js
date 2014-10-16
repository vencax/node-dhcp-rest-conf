var express = require('express')
  , Resource = require('express-resource')
  , bodyParser = require('body-parser')
  , app = express();

// create API app -------------------------------------------------------------

var api = express();

if (! ('FRONTEND_APP' in process.env)) {
  api.use(require('cors')({maxAge: 86400}));
}

api.resource('dhcphosts', require('./controllers/hosts'));

var hoststate = require('./controllers/state');
api.put('/hoststate/:mac', hoststate.wake);
api.get('/hoststate/:ip', hoststate.stat);

api.post('/login', function(req, res) {
  res.json({ message: 'logging in!' });
});

// create main app ------------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if ('FRONTEND_APP' in process.env) {
  // mount angular frontend -> no need for CORS
  console.log("mounting angular frontend ...");
  app.use(express.static(process.env.FRONTEND_APP));
}

var prefix = '/api';
app.use(prefix, api);

exports.app = app;
