'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _browserifyTransformTools = require('browserify-transform-tools');

var _browserifyTransformTools2 = _interopRequireDefault(_browserifyTransformTools);

var _lodash = require('lodash');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _resolve = require('resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var defaults = {
  'autoInject': {
    'verbose': false,
    'styleTag': false
  },
  'sass': {
    'sourceComments': false,
    'sourceMap': false,
    'sourceMapEmbed': false,
    'sourceMapContents': false,
    'outputStyle': 'compressed'
  },
  'postcss': false,
  'rootDir': process.cwd()
};

var MODULE_NAME = _path2['default'].basename(_path2['default'].dirname(__dirname));

var Transformer = _browserifyTransformTools2['default'].makeStringTransform(MODULE_NAME, {
  includeExtensions: ['.css', '.sass', '.scss'],
  evaluateArguments: true
}, function (content, opts, done) {
  var file = opts.file;
  var config = opts.config;

  var options = (0, _lodash.merge)({}, defaults, (0, _lodash.omit)(config, '_flags'));
  var userSassOpts = options.sass;

  delete options.sass;
  var sassOpts = (0, _lodash.merge)({}, userSassOpts);
  sassOpts.includePaths = sassOpts.includePaths || [];
  sassOpts.includePaths.unshift(_path2['default'].dirname(file));
  sassOpts.indentedSyntax = /\.sass$/i.test(file);
  sassOpts.file = file;
  sassOpts.data = content;
  sassOpts.outFile = file;

  if (options.autoInject === true) {
    options.autoInject = (0, _lodash.merge)({}, defaults.autoInject);
  }

  if (options.postcss !== false && !(typeof options.postcss === 'object')) {
    return done(new Error('Postcss config must be false or an object of plugins'));
  }

  var relativePath = _path2['default'].relative(options.rootDir, _path2['default'].dirname(file));
  var href = _path2['default'].join(relativePath, _path2['default'].basename(file));

  var postcssTransforms = options.postcss ? Object.keys(options.postcss).map(function (pluginName) {
    var pluginOpts = options.postcss[pluginName];
    var plugin = require(_resolve2['default'].sync(pluginName, { basedir: process.cwd() }));
    return plugin(pluginOpts);
  }) : null;

  _nodeSass2['default'].render(sassOpts, function (err, result) {
    if (err) return done(new SyntaxError(err.file + ': ' + err.message + ' (' + err.line + ':' + err.column + ')'));
    var out = '';
    var css = options.postcss ? (0, _postcss2['default'])(postcssTransforms).process(result.css, {
      map: {
        inline: sassOpts.sourceMapEmbed,
        prev: sassOpts.sourceMapEmbed ? result.map.toString() : null
      }
    }).css : result.css;
    var cssString = JSON.stringify(css.toString());
    var cssBase64 = JSON.stringify('data:text/css;base64,' + new Buffer(css).toString('base64'));

    if (options.autoInject !== false && typeof options.autoInject === 'object') {
      if (options.autoInject.styleTag) {
        var verbose = options.autoInject.verbose ? '{"href": ' + JSON.stringify(href) + '}' : '{}';
        out += 'module.exports.tag = require(\'' + MODULE_NAME + '\').createStyle(' + cssString + ', ' + verbose + ');';
      } else {
        out += 'module.exports.tag = require(\'' + MODULE_NAME + '\').createLink(' + cssBase64 + ');';
      }
    }

    out += ' module.exports.css = ' + cssString + ';';

    return done(null, out);
  });
});

exports['default'] = Transformer;
module.exports = exports['default'];