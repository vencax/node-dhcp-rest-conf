
should = require('should')


module.exports = (port, request, execenv) ->

  s = "http://localhost:#{port}"
  mac = "111111111111"
  ip = '192.168.1.23'

  it "must wake up the given host", (done) ->

    execenv.stdout = '1 received'
    execenv.res = []

    request.put "#{s}/hoststate/#{mac}", (err, res, body) ->
      return done err if err

      res.statusCode.should.eql 200
      execenv.res[0].should.eql ["wakeonlan 11:11:11:11:11:11", {}]
      body = JSON.parse(body)
      body.should.eql 1
      done()

  it "must find out state of given host", (done) ->

    execenv.res = []

    request.get "#{s}/hoststate/#{mac}", (err, res, body) ->
      return done err if err

      res.statusCode.should.eql 200
      execenv.res[0].should.eql ["ping -c 1 #{ip}", {}]
      body = JSON.parse(body)
      body.should.eql 1
      done()
