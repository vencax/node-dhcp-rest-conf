
should = require('should')
http = require('http')
request = require('request').defaults({timeout: 5000})
fs = require('fs')
bodyParser = require('body-parser')
express = require('express')
horaa = require('horaa')

port = process.env.PORT || 3333
process.env.MAXWAKEWAIT = 100
process.env.WAKEWAITINTERVAL = 50

rsv = '{"11:11:11:11:11:11": {"ip": "192.168.1.23", "name": "pri", "desc": ""}}'
lss = '{"192.168.1.2": ["23:22:33:44:55:66", "pokkk"],'
lss += '"192.168.1.3": ["33:33:33:33:33:33", "pokkk2"]}'

# entry ...
describe "app", ->

  execenv =
    res: []

  child_process_moc = horaa('child_process')
  child_process_moc.hijack 'exec', (prog, pars, cb) ->
    rpars = if cb then pars else {}
    cb ?= pars
    execenv.res.push([prog, rpars])
    if cb
      if prog.indexOf('getreserved') >= 0
        return cb(null, rsv, null)
      if prog.indexOf('getleases') >= 0
        return cb(null, lss, null)
      cb(execenv.err || null, execenv.stdout || null, execenv.stderr || null)

  # init server
  app = []
  server = []

  before (done) ->
    app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use('/', require(__dirname + '/../lib/app'))
    server = app.listen port, (err) ->
      return done(err) if err
      done()

  after (done) ->
    server.close()
    done()

  it "should exist", (done) ->
    should.exist app
    done()

  # run the rest of tests
  require('./dhcphosts')(port, request, execenv)
  require('./hoststate')(port, request, execenv)
