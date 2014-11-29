
should = require('should')
http = require('http')
request = require('request').defaults({timeout: 5000})
fs = require('fs')
bodyParser = require('body-parser')
express = require('express')

port = process.env.PORT || 3333


# entry ...
describe "app", ->

  if process.env.NODE_ENV == 'devel'
    console.log("Sending only requests to localhost:#{port}")
  else

    results = {}

    # init server
    app = []
    server = []

    before (done) ->
      app = express()
      app.use(bodyParser.urlencoded({ extended: false }))
      app.use(bodyParser.json())
      app.use('/', require(__dirname + '/../index'))
      server = app.listen(port, (err) ->
        return done(err) if err
        done()
      )

    after (done) ->
      server.close()
      done()

    it "should exist", (done) ->
      should.exist app
      done()

  # run the rest of tests
  require('./dhcphosts')(port, request)
  require('./hoststate')(port, request, results)
