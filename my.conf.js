// Karma configuration
// Generated on Tue May 24 2016 16:14:29 GMT+0800 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'node_modules/should/should.js', include: true},
      'public/src/js/**/*.js',
      'test-lib/**/ *.js',
      'test/**/*.js',
    ],

    webpack:{
      module:{
        loaders:[
          { test: /\.vue$/, loader:'vue'},
          { test:/\.css$/, loader: 'style!css!less!' },
          { test:/\.scss$/, loader: 'style!css!less!sass' }
        ]
      }
    },
    // list of files to exclude
    exclude: [
      'my.conf.js'
    ],
    reporters: ['progress','mocha', 'coverage','htmlalt'],
    mochaReporter: {
      output: 'autowatch' //自动监听测试文件是否修改
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'public/src/*.js':['webpack'],
      'public/src/**/*.js':['webpack'],
      'public/src/*.vue':['webpack'],
      'test/*.js':['webpack'],
    },
    htmlReporter: {
      outputFile: 'unitTestResult/units.html', //web形式输出目录

      // Optional
      pageTitle: '企业版2.0单元测试', //描述
      subPageTitle: '66666'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    coverageReporter: {
      // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
      type: 'lcov',
      dir: 'coverage/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'Safari', 'PhantomJS', 'Opera', 'IE', 'ChromeCanary'],


    //captureTimeout: 10000, //超时处理
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    plugins: [
      require('karma-mocha'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-mocha-reporter'),
      require('karma-htmlfilealt-reporter'),
      require('karma-webpack'),
    ],
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
