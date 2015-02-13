
should = require('should')


module.exports = (port, request, execenv) ->

  _getObj = ->
    v =
      mac: "444444444444"
      ip: 4
      name: "newHost1"
      desc: "testing voting 1 desc"

  s = "http://localhost:#{port}"
  net = "192-168-1"
  initialLen = null

  _verExec = (execenvRec, desired) ->
    execenvRec[0].indexOf(desired).should.eql 0


  beforeEach (done) ->
    execenv.res = []
    done()

  it "shall list DB state", (done) ->
    request "#{s}/dhcphosts/#{net}", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      execenv.res.should.eql []
      initialLen = body.length
      done()

  it "must not create if requred param (name) is missing", (done) ->
    withoutname = _getObj()
    delete withoutname['name']

    request.post "#{s}/dhcphosts/#{net}", {form: withoutname}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      execenv.res.should.eql []
      done()

  it "must not create if requred param mac is missing", (done) ->
    without = _getObj()
    delete without['mac']

    request.post "#{s}/dhcphosts/#{net}", {form: without}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      execenv.res.should.eql []
      done()

  it "must not create if requred param ip is missing", (done) ->
    without = _getObj()
    delete without['ip']

    request.post "#{s}/dhcphosts/#{net}", {form: without}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      execenv.res.should.eql []
      done()

  it "should create new item on valid POST request", (done) ->
    data = {form: _getObj()}
    request.post "#{s}/dhcphosts/#{net}/", data, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 201
      res.should.be.json
      body = JSON.parse(body)
      body.name.should.eql 'newHost1'
      body.ip.should.eql 4
      body.mac.should.eql '444444444444'
      body.desc.should.eql 'testing voting 1 desc'
      _verExec(execenv.res[0], 'dhcpdmanip_cli.py add')

      done()

  it "must not create if mac already exists in DB", (done) ->
    h = _getObj()
    h.ip = "192.168.1.111"
    h.name = "newHost1WWWWW"

    request.post "#{s}/dhcphosts/#{net}", {form: h}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      execenv.res.should.eql []
      done()

  it "must not create if ip already exists in DB", (done) ->
    h = _getObj()
    h.mac = '11e111111221'
    h.name = "newHost1WWWWW"

    request.post "#{s}/dhcphosts/#{net}", {form: h}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      execenv.res.should.eql []
      done()

  it "must not create if name already exists in DB", (done) ->
    h = _getObj()
    h.mac = '11e111111221'
    h.ip = "192.168.1.121"

    request.post "#{s}/dhcphosts/#{net}", {form: h}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      execenv.res.should.eql []
      done()

  it "shall return list of all in network (including the initial)", (done) ->
    request "#{s}/dhcphosts/#{net}", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      body.length.should.eql 1 + initialLen
      execenv.res.should.eql []
      done()

  urlOfNonexistent = "#{s}/dhcphosts/#{net}/222/"

  it "shall return 404 on get nonexistent host", (done) ->
    request urlOfNonexistent, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 404
      execenv.res.should.eql []
      done()

  created = undefined
  createdURI = undefined

  # it "shall return list of lenght 3 (2 + 1 just created)", (done) ->
  #   request "#{s}/dhcphosts", (err, res, body) ->
  #     return done err if err
  #     res.statusCode.should.eql 200
  #     items = JSON.parse(body)
  #     items.length.should.eql 3
  #     created = items[2]
  #     created.name.should.eql 'newHost1'
  #     done()

  it "shall return object with given ID", (done) ->
    createdURI = "#{s}/dhcphosts/#{net}/#{_getObj().mac}/"
    request createdURI, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      item = JSON.parse(body)
      expected = _getObj()
      item.mac.should.eql expected.mac
      item.name.should.eql expected.name
      item.ip.should.eql expected.ip
      execenv.res.should.eql []
      done()

  changed =
    name: "TheChangedHost"

  it "shall update item with given ID with desired values", (done) ->
    request.put createdURI, {form: changed}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      changed = JSON.parse(body)
      changed.name.should.eql changed.name
      changed.ip.should.eql 4
      _verExec(execenv.res[0], 'dhcpdmanip_cli.py remove')
      _verExec(execenv.res[1], 'dhcpdmanip_cli.py add')
      done()

  it "shall return 404 on updating nonexistent item", (done) ->
    request.put urlOfNonexistent, {form: changed}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 404
      execenv.res.should.eql []
      done()

  it "shall return 404 on removing nonexistent item", (done) ->
    request.del urlOfNonexistent, {form: changed}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 404
      execenv.res.should.eql []
      done()

  it "shall return 200 on removing the created", (done) ->
    request.del createdURI, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      _verExec(execenv.res[0], 'dhcpdmanip_cli.py remove')
      done()

  it "shall return list again only the initial after removal created", (done) ->
    request "#{s}/dhcphosts/#{net}", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      body.length.should.eql 0 + initialLen
      execenv.res.should.eql []
      done()

  it "should change lease to reservation", (done) ->
    lease =
      mac: "333333333333"
      ip: 22
      name: "hostFromLease"
      res: true
    rurl = "#{s}/dhcphosts/#{net}/#{lease.mac}"
    request.put rurl, {form: lease}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      res.should.be.json
      body = JSON.parse(body)
      body.name.should.eql lease.name
      body.ip.should.eql lease.ip
      body.mac.should.eql lease.mac
      body.res = true
      console.log execenv.res
      _verExec(execenv.res[0], 'dhcpdmanip_cli.py add')
      done()

  it "must create reservation when IP is held by lease", (done) ->
    v =
      mac: "222222222222"
      name: "rewritenLeasedHost"
      ip: 2
    request.post "#{s}/dhcphosts/#{net}", {form: v}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 201
      body = JSON.parse(body)
      body.name.should.eql v.name
      body.ip.should.eql v.ip
      body.mac.should.eql v.mac
      _verExec(execenv.res[0], 'dhcpdmanip_cli.py add')
      done()

  it "now returns list initial hosts that are all reservations", (done) ->
    request "#{s}/dhcphosts/#{net}", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      console.log body
      body.length.should.eql initialLen
      for e in body
        e.res.should.eql true
      execenv.res.should.eql []
      done()
