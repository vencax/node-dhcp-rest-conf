
should = require('should')


module.exports = (port, request, results) ->

  s = "http://localhost:#{port}"


  it "must wake up the given host", (done) ->

    host = '112233441122'

    request.put "#{s}/hoststate/#{host}", (err, res, body) ->
      return done err if err

      res.statusCode.should.eql 200
      body = JSON.parse(body)
      body.should.eql 1
      done()
