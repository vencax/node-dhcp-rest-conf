
should = require('should')
http = require('http')
request = require('request').defaults({timeout: 5000})
fs = require('fs')

port = process.env.PORT || 3333


# entry ...
describe "app", ->

  if process.env.NODE_ENV == 'devel'
    console.log("Sending only requests to localhost:#{port}")
  else
    # mock py-dhcp-wrapper
    horaa = require('horaa')
    mockWrapper = horaa('node-py-dhcpd-manip-wrapper')

    mockWrapper.hijack 'add', (name, mac, ip, cb) ->
      added =
        name: name
        mac: mac
        ip: ip
      cb(null, added)

    mockWrapper.hijack 'remove', (mac, cb) ->
      cb(null, 'OK')

    mockWrapper.hijack 'getleases', (cb) ->
      leases =
        '192.168.1.233': ['112233445566', 'lease1']

      cb(null, leases)

    mockWrapper.hijack 'getreserved', (cb) ->
      reserved =
        '111111111111': {name: 'host1', ip: '192.168.1.1'}
      cb(null, reserved)

    # init server
    app = []
    server = []

    before (done) ->
      app = require(__dirname + '/../app').app
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
