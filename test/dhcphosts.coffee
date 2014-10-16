
should = require('should')


module.exports = (port, request) ->

  _getObj = ->
    v =
      mac: "333333333333"
      ip: "192.168.1.11"
      name: "newHost1"
      desc: "testing voting 1 desc"

  s = "http://localhost:#{port}"


  it "must not create if requred param (name) is missing", (done) ->
    withoutname = _getObj()
    delete withoutname['name']

    request.post "#{s}/dhcphosts", {form: withoutname}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "must not create if requred param mac is missing", (done) ->
    without = _getObj()
    delete without['mac']

    request.post "#{s}/dhcphosts", {form: without}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "must not create if requred param ip is missing", (done) ->
    without = _getObj()
    delete without['ip']

    request.post "#{s}/dhcphosts", {form: without}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "must not create if mac already exists in DB", (done) ->
    h =
      mac: "111111111111"
      ip: "192.168.1.11"
      name: "newHost1"
      desc: "testing voting 1 desc"

    request.post "#{s}/dhcphosts", {form: h}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "must not create if ip already exists in DB", (done) ->
    h =
      mac: "111111111221"
      ip: "192.168.1.1"
      name: "newHost1"
      desc: "testing voting 1 desc"

    request.post "#{s}/dhcphosts", {form: h}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "must not create if name already exists in DB", (done) ->
    h =
      mac: "111111111221"
      ip: "192.168.1.11"
      name: "host1"
      desc: "testing voting 1 desc"

    request.post "#{s}/dhcphosts", {form: h}, (err, res) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "must not create anything when already exists", (done) ->
    v =
      mac: "111111111111"
      ip: "192.168.1.11"
      name: "newHost1"
    request.post "#{s}/dhcphosts", {form: v}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 400
      done()

  it "shall return the loaded list", (done) ->
    request "#{s}/dhcphosts", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      body.length.should.eql 2
      done()


  it "shall return 404 on get nonexistent host", (done) ->
    request "#{s}/dhcphosts/22222", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 404
      done()

  it "should create new item on right POST request", (done) ->
    request.post "#{s}/dhcphosts/", {form: _getObj()}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 201
      res.should.be.json
      body = JSON.parse(body)
      body.name.should.eql 'newHost1'
      body.ip.should.eql '192.168.1.11'
      body.mac.should.eql '333333333333'
      body.desc.should.eql 'testing voting 1 desc'
      done()

  created = undefined
  createdURI = undefined

  it "shall return list of lenght 3 (2 + 1 just created)", (done) ->
    request "#{s}/dhcphosts", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      items = JSON.parse(body)
      items.length.should.eql 3
      created = items[2]
      created.name.should.eql 'newHost1'
      done()

  it "shall return object with given ID", (done) ->
    createdURI = "#{s}/dhcphosts/#{_getObj().mac}/"
    request createdURI, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      item = JSON.parse(body)
      expected = _getObj()
      item.mac.should.eql expected.mac
      item.name.should.eql expected.name
      item.ip.should.eql expected.ip
      done()

  changed =
    name: "The changed host"

  it "shall update item with given ID with desired values", (done) ->
    request.put createdURI, {form: changed}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      changed = JSON.parse(body)
      changed.name.should.eql 'The changed host'
      changed.ip.should.eql '192.168.1.11'
      done()

  it "shall return 404 on updating nonexistent voting", (done) ->
    request.put "#{s}/dhcphosts/22222/", {form: changed}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 404
      done()

  it "shall return 404 on removing nonexistent object", (done) ->
    request.del "#{s}/dhcphosts/22222/", {form: changed}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 404
      done()

  it "shall return 200 on removing the created", (done) ->
    request.del createdURI, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      done()

  it "shall return list again only the initial after removal created", (done) ->
    request "#{s}/dhcphosts", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      body.length.should.eql 2
      done()

  it "should change lease item to reservation", (done) ->
    lease =
      mac: "112233445566"
      ip: "192.168.1.111"
      name: "newHost1FromLease"
    request.post "#{s}/dhcphosts/", {form: lease}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 201
      res.should.be.json
      body = JSON.parse(body)
      body.name.should.eql 'newHost1FromLease'
      body.ip.should.eql '192.168.1.111'
      body.mac.should.eql '112233445566'
      body.res = true
      done()

  it "now returns list of 2 reservations", (done) ->
    request "#{s}/dhcphosts", (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 200
      body = JSON.parse(body)
      body.length.should.eql 2
      for e in body
        e.res.should.eql true
      done()

  it "must create reservation when IP is held by lease", (done) ->
    v =
      mac: "aabbccaa1111"
      name: "fromLeasedHost"
      ip: "192.168.1.233"
    request.post "#{s}/dhcphosts", {form: v}, (err, res, body) ->
      return done err if err
      res.statusCode.should.eql 201
      body = JSON.parse(body)
      body.name.should.eql v.name
      body.ip.should.eql v.ip
      body.mac.should.eql v.mac
      done()
