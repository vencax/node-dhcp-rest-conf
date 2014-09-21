
should = require('should')
http = require('http')
request = require('request').defaults({timeout: 50000})
fs = require('fs')

port = 3000

describe "app", ->

  console.log("Sending only requests to localhost:#{port}")

  # run the rest of tests
  require('./dhcphosts')(port)