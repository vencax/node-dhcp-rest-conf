module.exports = (grunt) ->

  # load all grunt tasks
  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks

  grunt.initConfig
    watch:
      coffee:
        files: ["lib/{,*/}*.coffee"]
        options: { nospawn: true }
        tasks: ["coffee:target", "develop"]

      coffeeTest:
        files: ["test/spec/{,*/}*.coffee"]
        tasks: ["test"]

    connect:
      options:
        port: 9000

        # Change this to '0.0.0.0' to access the server from outside.
        hostname: "localhost"

    develop:
      server:
        file: 'main.js'
        cmd: 'node'
        nodeArgs: ['--debug']
        env:
          NODE_ENV: 'devel'
          PORT: 3000

    coffeelint:
      app: ["{,*/}*.coffee"]

    mochaTest:
      test:
        options:
          require: ["coffee-script"]

        src: ["test/main.coffee"]

      requests:
        src: ["test/dorequests.coffee"]


  grunt.registerTask "run", ["clean", "coffee", "develop", "watch"]
  grunt.registerTask "test", ["coffeelint", "mochaTest:test"]
  grunt.registerTask "default", ["mochaTest:requests"]
