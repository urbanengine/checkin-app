'use strict';
let path = require('path');
let defaultSettings = require('./defaults');

// Get our api routes
const api = require('../server/routes/api');

// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, '../node_modules');
// let additionalPaths = [ path.join(npmBase, 'react-bootstrap') ];
let additionalPaths = [];

module.exports = {
  additionalPaths: additionalPaths,
  port: defaultSettings.port,
  debug: true,
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: defaultSettings.publicPath
  },
  devServer: {
    contentBase: './src/',
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false,
    setup: function(app) {
      // Set our api routes
      app.use('/api', api);
    }
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      components: `${defaultSettings.srcPath}/components/`,
      styles: `${defaultSettings.srcPath}/styles/`,
      fonts: `${defaultSettings.srcPath}/fonts/`,
      config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
      'react/lib/ReactMount': 'react-dom/lib/ReactMount'
    }
  },
  module: {}
};
