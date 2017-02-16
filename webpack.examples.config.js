/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')
const env = require('yargs').argv.mode

const fileName = 'contrail-charts-examples'
const plugins = []
const loaders = [{
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
}, {
  test: /\.json$/,
  loader: 'json-loader'
}, {
  test: /\.tmpl/,
  loader: 'handlebars-loader',
}]

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    include: /\.min\.js$/,
    minimize: false,
  }))
  loaders.push({
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: /(node_modules)/,
    query: {
      presets: ['es2015']
    }
  })
}

plugins.push(new ExtractTextPlugin('css/' + fileName + '.css'))

const config = {
  entry: {
    'demo-loader': path.join(__dirname, '/examples/common/js/demo-loader.js'),
    'dev-loader': path.join(__dirname, '/examples/common/js/dev-loader.js'),
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/build/examples'),
    filename: 'js/' + '[name].bundle.js'
  },
  module: {loaders},
  externals: {
    jquery: { amd: 'jquery', root: 'jQuery' },
    d3: { amd: 'd3v4', root: 'd3' },
    // lodash: { amd: 'lodash', root: '_' },
    backbone: { amd: 'backbone', root: 'Backbone' },
    coCharts: 'coCharts'
  },
  resolve: {
    root: './',
    alias: {
      'fixture': 'tests/generator.js',
      'formatter': 'examples/common/js/value-formatters.js',
      'constants': 'examples/common/js/constants.js',
      'commons': 'examples/common/js/commons.js',
      'data-generator': 'examples/common/js/data-generator.js'
    },
    extensions: ['', '.js']
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  plugins: plugins,
  stats: { children: false }
}

module.exports = config
