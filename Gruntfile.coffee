module.exports = (grunt) ->

  # load all grunt tasks
  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks

  devPort = 3000

  grunt.initConfig
    watch:
      scripts:
        files: '**/*.js'
        options: { nospawn: true }
        tasks: ["develop", "watch"]

      coffeeTest:
        files: ["test/{,*/}*.coffee"]
        tasks: ["test"]
        options: { nospawn: true }

    develop:
      server:
        file: 'main.js'
        cmd: 'node'
        nodeArgs: ['--debug']
        env:
          NODE_ENV: 'devel'
          PORT: devPort

    exec:
      reqs: "export NODE_ENV=devel && export PORT=#{devPort} && \
            mocha --timeout=3000 --compilers coffee:coffee-script/register \
            test/main.coffee"

    coffeelint:
      app: ["{,*/}*.coffee"]

    mochaTest:
      test:
        options:
          require: ["coffee-script"]

        src: ["test/main.coffee"]


  grunt.registerTask "run", ["develop", "watch"]
  grunt.registerTask "test", ["coffeelint", "mochaTest:test"]
  grunt.registerTask "default", ["mochaTest:requests"]
