require('coffee-script/register');
var express = require('express');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var cors = require('cors');

var port = process.env.PORT || 8080;

var corsOptions = {
  origin: process.env.CORSORIGIN
};

// create API
var api = express();
// enable CORS
api.use(cors({maxAge: 86400}));
api.use(bodyParser.json())
// secure it with JWT
api.use(expressJwt({secret: process.env.SERVER_SECRET}));
// create the routes
api.use(require('./lib/app'));

api.use(function(err, req, res, next) {
  if(err.name && err.name === 'UnauthorizedError') {
    return res.status(401).send(err.message);
  }
  next(err);
});

api.listen(port, function() {
  console.log('gandalf do magic on ' + port);
});
