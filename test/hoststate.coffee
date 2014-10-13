
should = require('should')


module.exports = (port, request, results) ->

  s = "http://localhost:#{port}"


  it "must wake up the given host", (done) ->

    host = '112233441122'

    request.put "#{s}/hoststate/#{host}", (err, res) ->
      return done err if err
      res.statusCode.should.eql 200
      results.res.should.eql ["wakeonlan #{host}", {}]
      results = {}
      done()


