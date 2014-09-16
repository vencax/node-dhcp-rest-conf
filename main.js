// ENTRY POINT

var port = process.env.PORT || 8080;

require('./app').app.listen(port, function() {
  console.log('listening on ' + port);
});
