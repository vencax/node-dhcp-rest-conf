require('coffee-script/register');
var express = require('express');
var expressJwt = require('express-jwt');

var port = process.env.PORT || 8080;

// create API
var api = express();
api.use(bodyParser.json())
// secure it with JWT
api.use(expressJwt({secret: process.env.SERVER_SECRET}));
// create the routes
api.use(require('./lib/app'));

app.listen(port, function() {
  console.log('gandalf do magic on ' + port);
});
