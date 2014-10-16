
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
    # mock py-dhcp-wrapper
    horaa = require('horaa')
    mockWrapper = horaa('node-py-dhcpd-manip-wrapper')

    mockWrapper.hijack 'add', (name, mac, ip, desc, cb) ->
      added =
        name: name
        mac: mac
        ip: ip
        desc: desc
      cb(null, added)

    mockWrapper.hijack 'remove', (mac, cb) ->
      cb(null, 'OK')

    mockWrapper.hijack 'getleases', (cb) ->
      leases =
        '192.168.1.233': ['112233445566', 'lease1']
      cb(null, leases)

    mockWrapper.hijack 'getreserved', (cb) ->
      reserved =
        '111111111111': {name: 'host1', ip: '192.168.1.1', desc: 'test host1'}
      cb(null, reserved)

    results = {}

    child_process_moc = horaa('child_process')
    child_process_moc.hijack 'exec', (prog, pars, cb) ->
      rpars = if cb then pars else {}
      cb ?= pars
      results['res'] = [prog, rpars]
      r = cb(null, null, null)

    # init server
    app = []
    server = []

    before (done) ->
      app = express()
      app.use(bodyParser.urlencoded({ extended: false }))
      app.use(bodyParser.json())
      app.use('/', require(__dirname + '/../app'))
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
