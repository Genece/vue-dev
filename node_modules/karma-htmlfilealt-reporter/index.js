var os = require('os');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var builder = require('xmlbuilder');

var HTMLReporter = function(baseReporterDecorator, config, emitter, logger,
		helper, formatError) {
	var outputFile = config.htmlReporter.outputFile;
	var pageTitle = config.htmlReporter.pageTitle || 'Unit Test Results';
	var subPageTitle = config.htmlReporter.subPageTitle || false;
	var log = logger.create('reporter.html');

	var html;
	var body;
	var mainBody;
	var sideMenu;
	var suites;
	var resultsContainer;
	var tabsContainer;
	var tabContent;
	var pendingFileWritings = 0;
	var fileWritingFinished = function() {};
	var allMessages = [];

	baseReporterDecorator(this);

	// TODO: remove if public version of this method is available
	var basePathResolve = function(relativePath) {

		if (helper.isUrlAbsolute(relativePath)) {
			return relativePath;
		}

		if (!helper.isDefined(config.basePath)
				|| !helper.isDefined(relativePath)) {
			return '';
		}

		return path.resolve(config.basePath, relativePath);
	};

	var htmlHelpers = {
		createHead : function() {
			var cssAssetsUrls = ['bootstrap.css', 'overwrite.css','c3.css'];
			var head = html.ele('head');
			head.ele('meta', {
				charset : 'utf-8'
			});
			head.ele('title', {}, pageTitle
					+ (subPageTitle ? ' - ' + subPageTitle : ''));
			
			cssAssetsUrls.forEach(function(asset, index){
				if(asset.indexOf('.css') !== -1){
					head.ele('link', {
						type : 'text/css',
						rel : 'stylesheet',
						href : 'assets/css/' + asset
					});
				}
			});
		},
		
		createBody : function() {
			var scriptAssetUrls = ['d3.js', 'c3.js','jquery.min.js','tab.js', 'app.js'];
			body = html.ele('body');
			var nav = body.ele('nav', {
				class : "navbar navbar-inverse navbar-fixed-top"
			}).ele('div', {
				class : "container-fluid"
			});
			
			var navHeaderSection = nav.ele('div', {class: "navbar-header"});
			navHeaderSection.ele('span', {
				class : "glyphicon glyphicon-list-alt navbar-brand"
			});

			nav.ele('h3', {
				class : "navbar-text"
			}, pageTitle);
			
			nav.ele('h4', {class : "nav navbar-nav navbar-text ow-sub-title"}, subPageTitle);
			
			mainBody = body.ele('div', {class: "container-fluid position-offset"}).ele('div', {class: 'row'});
			
			sideMenu = mainBody.ele('div', {class: 'col-xs-2 sidebar-offcanvas', id : 'sidebar', role: 'navigation'});
			var ul = sideMenu.ele('ul', {class: 'nav nav-sidebar'});
			ul.ele('li', {class: 'active top'}).ele('a', {href: '#'}, "Overview");
			
			resultsContainer = mainBody.ele('div', {class: 'col-xs-10 main'});
			
			resultsContainer.ele('div', {id: "chart"},'')
			tabsContainer = resultsContainer.ele('ul', {class: 'nav nav-tabs', id: 'myTab'}, '');
			tabContent = resultsContainer.ele('div', {class: 'tab-content', id: 'myTabContent'},'');
			
			body.ele('footer', {}).ele('p', {class: 'pull-right'});
			
			scriptAssetUrls.forEach(function(asset, index){
				if(asset.indexOf('.js') !== -1){
					body.ele('script', {
						src : 'assets/js/'+ asset
					}, '');
				}
			});
		}
	};
	
	var formBrowserId = function(browser){
		return browser.name.substr(0, browser.name.indexOf(' '));
	};
	
	var createHtmlTabs = function(browser, index){
		if(index === 0){
			tabsContainer.ele('li', {class: 'active'}, '').ele('a', {href:'#'+ formBrowserId(browser), 'data-toggle': 'tab'}, browser.name);
		}else{
			tabsContainer.ele('li', {class: ''}, '').ele('a', {href:'#'+formBrowserId(browser), 'data-toggle': 'tab'}, browser.name);
		}
		
	};

	var createHtmlResults = function(browser) {
		var suite;
		var header;
		var useClass;
		var timestamp = (new Date()).toLocaleString();
		
		suite = suites[browser.id] = tabContent.ele('div', {class: 'tab-pane fade', id: formBrowserId(browser)}).ele('table', {
			class : 'table table-bordered table-hover'
		});
		
		suite.ele('caption', {class: ''}, "Test Results running in "+ browser.name + ' Timestamp: ' + timestamp);
		
		suites[browser.id]['results'] = suite.ele('tr').ele('td', {colspan : '3'});
		
		header = suite.ele('tr', {
			class : 'header'
		});
		header.ele('td', {}, 'Status');
		header.ele('td', {}, 'Spec');
		header.ele('td', {}, 'Suite / Results');
	};

	this.adapters = [ function(msg) {
		allMessages.push(msg);
	} ];

	this.onRunStart = function(browsers) {
		suites = {};

		html = builder.create('html', null, 'html', {
			headless : true
		});
		html.doctype();

		htmlHelpers.createHead();
		htmlHelpers.createBody();
		
		browsers.forEach(function(browser, index) {
			createHtmlTabs(browser, index);
		});
		
		if (!this.onBrowserStart) {
			browsers.forEach(function(browser) {
				createHtmlResults(browser);
			});
		}
	};

	if (this.onBrowserStart) {
		this.onBrowserStart = function(browser) {
			createHtmlResults(browser);
		};
	}

	this.onBrowserComplete = function(browser) {
		var suite = suites[browser.id];
		var result = browser.lastResult;

		if (suite && suite['results']) {
			suite['results'].txt(result.total + ' tests / ');
			suite['results'].txt((result.disconnected || result.error ? 1 : 0)
					+ ' errors / ');
			suite['results'].txt(result.failed + ' failures / ');
			suite['results'].txt(result.skipped + ' skipped / ');
			suite['results'].txt('runtime: ' + ((result.netTime || 0) / 1000)
					+ 's');
			
			fse.writeJson('node_modules/karma-htmlfilealt-reporter/assets/testresult.json', 
					{
					passed: (result.total - result.failed),
					failed: result.failed,
					skipped: result.skipped,
					disconnected: result.error? 1: 0
					}, function(err){
						if(err){
							console.log(err);
						}
					});

			if (allMessages.length > 0) {
				suite.ele('tr', {
					class : 'system-out'
				}).ele('td', {
					colspan : '3'
				}).raw(
						'<strong>System output:</strong><br />'
								+ allMessages.join('<br />'));
			}
		}
	};

	this.onRunComplete = function() {
		var htmlToOutput = html;

		pendingFileWritings++;

		config.basePath = path.resolve(config.basePath || '.');
		outputFile = basePathResolve(outputFile);
		helper.normalizeWinPath(outputFile);

		helper.mkdirIfNotExists(
						path.dirname(outputFile),
						function() {
							fs.writeFile(outputFile, htmlToOutput.end({
								pretty : true
							}), function(err) {
								if (err) {
									log.warn('Cannot write HTML report\n\t'
											+ err.message);
								} else {
									log.debug('HTML results written to "%s".',
											outputFile);
								}

								if (!--pendingFileWritings) {
									fileWritingFinished();
								}
							});

							// copy the style sheet
							var dir = path.parse(outputFile).dir
									+ "/assets/";
							fse.copy('node_modules/karma-htmlfilealt-reporter/assets/',dir,function(err) {
												if (err) {
													console.log("Cannot write css...");
													log.debug(err);
												}
											});
						});

		suites = html = null;
		allMessages.length = 0;
	};

	this.specSuccess = this.specSkipped = this.specFailure = function(browser,
			result) {
		var specClass = result.skipped ? 'warning' : (result.success ? 'success'
				: 'danger');
		var spec = suites[browser.id].ele('tr', {
			class : specClass
		});
		var suiteColumn;

		spec.ele('td', {},
				result.skipped ? 'Skipped' : (result.success ? ('Passed in '
						+ ((result.time || 0) / 1000) + 's') : 'Failed'));
		spec.ele('td', {}, result.description);
		suiteColumn = spec.ele('td', {class: 'specs-def'});
		suiteColumn.ele('div', {class: ''}).raw(result.suite.join(' &raquo; '));

		if (!result.success) {
			result.log.forEach(function(err) {
				suiteColumn.ele('pre', {class: 'pre-scrollable text-justify'}, formatError(err));
			});
		}
	};

	// TODO(vojta): move to onExit
	// wait for writing all the html files, before exiting
	emitter.on('exit', function(done) {
		if (pendingFileWritings) {
			fileWritingFinished = done;
		} else {
			done();
		}
	});
};

HTMLReporter.$inject = [ 'baseReporterDecorator', 'config', 'emitter',
		'logger', 'helper', 'formatError' ];

// PUBLISH DI MODULE
module.exports = {
	'reporter:htmlalt' : [ 'type', HTMLReporter ]
};