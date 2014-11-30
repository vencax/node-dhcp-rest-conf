
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
  require('./dhcphosts')(port, request)
  require('./hoststate')(port, request, execenv)
